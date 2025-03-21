from flask import Blueprint, jsonify, request, current_app, session
from flask_login import login_required, current_user
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from ..models import db, NUsers, UserSkills, UserCredits

userdata_bp = Blueprint("userdata_bp", __name__)
CORS(userdata_bp, supports_credentials=True)


@userdata_bp.route("/nusers-data", methods=["POST", "PUT"])
@login_required
def create_or_update_nuser():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        # Extract data fields...
        name = data.get("name")
        about = data.get("about")
        class_batch = data.get("classBatch")
        current_location = data.get("currentLocation")
        telegram = data.get("telegram")
        whatsapp = data.get("whatsapp")
        phone = data.get("phone")
        skills_list = set(data.get("skills", []))

        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            nuser = NUsers(
                id=current_user.id,
                name=name,
                email=current_user.email,
                about=about,
                class_batch=class_batch,
                current_location=current_location,
                telegram=telegram,
                whatsapp=whatsapp,
                phone=phone,
            )
            db.session.add(nuser)
            # No need to create UserCredits here; the event listener will handle it
        else:
            # Update existing user fields...
            nuser.name = name or nuser.name
            nuser.about = about if about is not None else nuser.about
            nuser.class_batch = (
                class_batch if class_batch is not None else nuser.class_batch
            )
            nuser.current_location = (
                current_location
                if current_location is not None
                else nuser.current_location
            )
            nuser.telegram = telegram if telegram is not None else nuser.telegram
            nuser.whatsapp = whatsapp if whatsapp is not None else nuser.whatsapp
            nuser.phone = phone if phone is not None else nuser.phone

            # Remove existing skills
            UserSkills.query.filter_by(nuser_id=nuser.id).delete()

        # Add new skills
        for skill in skills_list:
            new_skill = UserSkills(skill=skill, nuser_id=nuser.id)
            db.session.add(new_skill)

        db.session.commit()
        return jsonify({"success": "NUser profile created/updated successfully"}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in create_or_update_nuser: {e}")
        return jsonify({"error": str(e)}), 500


@userdata_bp.route("/nusers-view", methods=["GET"])
@login_required
def get_nuser_data():
    try:
        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            return jsonify({"error": "User not found"}), 404

        credits = nuser.user_credits.credits if nuser.user_credits else 0

        # Get user's posts
        posts = [
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "timestamp": post.timestamp.isoformat(),
                "likes": post.likes,
                "credits": post.credits,
                "type": post.type,
                "tags": [tag.name for tag in post.tags],
            }
            for post in nuser.posts
        ]

        nuser_data = {
            "name": nuser.name,
            "email": nuser.email,
            "about": nuser.about,
            "classBatch": nuser.class_batch,
            "currentLocation": nuser.current_location,
            "telegram": nuser.telegram,
            "whatsapp": nuser.whatsapp,
            "phone": nuser.phone,
            "skills": [skill.skill for skill in nuser.skills],
            "credits": credits,
            "posts": posts,  # Include the user's posts
        }
        return jsonify(nuser_data), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in get_nuser_data: {e}", exc_info=True)
        return jsonify({"error": "Database error"}), 500


@userdata_bp.route("/search/users", methods=["GET"])
@login_required
def search_users():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    try:
        # Match users whose names start with the search query
        users = NUsers.query.filter(NUsers.name.ilike(f"{query}%")).all()

        results = [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "picture": user.picture,
                "about": user.about,
                "classBatch": user.class_batch,
                "currentLocation": user.current_location,
                "telegram": user.telegram,
                "whatsapp": user.whatsapp,
                "phone": user.phone,
                "skills": [skill.skill for skill in user.skills],
                "credits": user.user_credits.credits if user.user_credits else 0,
            }
            for user in users
        ]
        return jsonify(results), 200
    except Exception as e:
        current_app.logger.error(f"Error searching users: {e}")
        return jsonify({"error": "Internal server error"}), 500
    

@userdata_bp.route("/give-kudos/<string:user_id>", methods=["POST"])
@login_required
def give_kudos(user_id):
    # Prevent users from giving kudos to themselves
    if current_user.id == user_id:
        return jsonify({"error": "You cannot give kudos to yourself"}), 400

    # Use the session to track which users current_user has already given kudos to
    kudos_given = session.get("kudos_given", {})  # This should be a dict mapping target user IDs to True
    if kudos_given.get(user_id):
        return jsonify({"error": "You have already given kudos to this user"}), 400

    try:
        # Retrieve the target user
        recipient = NUsers.query.filter_by(id=user_id).first()
        if not recipient:
            return jsonify({"error": "User not found"}), 404

        # If the recipient does not have a credits record (should normally be auto-created), create one
        if not recipient.user_credits:
            recipient.user_credits = UserCredits(nuser_id=user_id, credits=0)
            db.session.add(recipient.user_credits)

        # Increment the recipient's credits
        recipient.user_credits.credits += 1
        db.session.commit()

        # Record in the session that the current user has given kudos to this recipient
        kudos_given[user_id] = True
        session["kudos_given"] = kudos_given

        return jsonify({
            "success": "Kudos given successfully",
            "new_credits": recipient.user_credits.credits
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error giving kudos: {e}", exc_info=True)
        return jsonify({"error": "Database error"}), 500
