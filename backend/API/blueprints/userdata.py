from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from ..models import db, NUsers, UserSkills

userdata_bp = Blueprint("userdata_bp", __name__)
CORS(userdata_bp, supports_credentials=True)

@userdata_bp.route("/nusers-data", methods=["POST"])
@login_required
def create_nuser():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        name = data.get("name")
        about = data.get("about")
        class_batch = data.get("classBatch")
        current_location = data.get("currentLocation")
        skills_list = set(data.get("skills", []))

        # Check if the user already has a profile
        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if nuser:
            return jsonify({"error": "User profile already exists"}), 400

        # Create new NUser instance
        nuser = NUsers(
            id=current_user.id,
            name=name,
            about=about,
            class_batch=class_batch,
            current_location=current_location,
        )
        db.session.add(nuser)

        # Add skills
        for skill in skills_list:
            new_skill = UserSkills(skill=skill, nuser_id=nuser.id)
            db.session.add(new_skill)

        db.session.commit()
        return jsonify({"success": "NUser profile created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in create_nuser: {e}")
        return jsonify({"error": str(e)}), 500

@userdata_bp.route("/nusers-data", methods=["PUT"])
@login_required
def update_nuser():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        current_app.logger.info(f"Received data: {data}")

        name = data.get("name")
        about = data.get("about")
        class_batch = data.get("classBatch")
        current_location = data.get("currentLocation")
        skills_list = set(data.get("skills", []))

        current_app.logger.info(f"Parsed data - class_batch: {class_batch}, current_location: {current_location}")

        # Retrieve the NUser instance
        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            return jsonify({"error": "User profile not found"}), 404

        # Update NUser information
        nuser.name = name
        nuser.about = about
        nuser.class_batch = class_batch
        nuser.current_location = current_location

        # Update skills
        # First, delete existing skills
        UserSkills.query.filter_by(nuser_id=nuser.id).delete()

        # Then, add new skills
        for skill in skills_list:
            new_skill = UserSkills(skill=skill, nuser_id=nuser.id)
            db.session.add(new_skill)

        db.session.commit()
        return jsonify({"success": "NUser profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in update_nuser: {e}")
        return jsonify({"error": str(e)}), 500

@userdata_bp.route("/nusers-view", methods=["GET"])
@login_required
def get_nuser_data():
    try:
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
