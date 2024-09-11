from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from ..models import db, NUsers, UserSkills

userdata_bp = Blueprint("userdata_bp", __name__)
CORS(userdata_bp, supports_credentials=True)


@userdata_bp.route("/nusers-data", methods=["POST"])
@login_required
def register_nuser():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        name = data["name"]
        about = data["about"]
        class_batch = data["classBatch"]
        current_location = data["currentLocation"]
        skills_list = set(data["skills"])

        # Retrieve or create the NUser instance
        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            nuser = NUsers(id=current_user.id)
            db.session.add(nuser)

        # Update NUser information
        nuser.name = name
        nuser.about = about
        nuser.class_batch = class_batch
        nuser.current_location = current_location

        # Manage associated skills
        current_skills = {skill.skill for skill in nuser.skills}
        for user_skill in nuser.skills:
            if user_skill.skill not in skills_list:
                db.session.delete(user_skill)
        for skill in skills_list:
            if skill not in current_skills:
                new_skill = UserSkills(skill=skill, nuser_id=nuser.id)
                db.session.add(new_skill)

        db.session.commit()
        return jsonify({"success": "NUser profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in register_nuser: {e}")
        return jsonify({"error": str(e)}), 500


@userdata_bp.route("/nusers-view", methods=["GET"])
@login_required
def get_nuser_data():
    try:
        if not current_user or not current_user.is_authenticated:
            return jsonify({"error": "User not logged in"}), 401

        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            return jsonify({"error": "User not found"}), 404

        nuser_data = {
            "name": nuser.name,
            "about": nuser.about,
            "class_batch": nuser.class_batch,
            "current_location": nuser.current_location,
            "skills": [skill.skill for skill in nuser.skills],
        }
        return jsonify(nuser_data), 200

    except SQLAlchemyError as e:
        current_app.logger.error(
            f"Database error in get_nuser_data: {e}", exc_info=True
        )
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(
            f"Unexpected error in get_nuser_data: {e}", exc_info=True
        )
        return jsonify({"error": "An unexpected error occurred"}), 500
