from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from ..models import (
    db,
    Courses,
    UserCurrentCourses,
    UserCompletedCourses,
    Users,
    NUsers,
    UserSkills,
)

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
        # Remove old skills that are not in the new data
        for user_skill in nuser.skills:
            if user_skill.skill not in skills_list:
                db.session.delete(user_skill)
        # Add new skills that are not already present
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
        # Ensure that the current_user is authenticated and has an ID
        if not current_user or not current_user.is_authenticated:
            return jsonify({"error": "User not logged in"}), 401

        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            return jsonify({"error": "User not found"}), 404

        # Construct the data dictionary
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


@userdata_bp.route("/update-nuser", methods=["PUT"])
@login_required
def update_nuser():
    try:
        data = request.get_json()
        nuser = NUsers.query.filter_by(id=current_user.id).first()
        if not nuser:
            return jsonify({"error": "User not found"}), 404

        # Update basic nuser data
        nuser.name = data.get("name", nuser.name)
        nuser.about = data.get("about", nuser.about)
        nuser.class_batch = data.get("classBatch", nuser.class_batch)
        nuser.current_location = data.get("currentLocation", nuser.current_location)

        # Manage associated skills
        new_skills = set(data.get("skills", []))

        # Remove old skills that are not in the new data
        for user_skill in nuser.skills[
            :
        ]:  # Copy to avoid modifying the list while iterating
            if user_skill.skill not in new_skills:
                db.session.delete(user_skill)

        # Add new skills that are not already present
        current_skills = {skill.skill for skill in nuser.skills}
        for skill in new_skills:
            if skill not in current_skills:
                new_skill = UserSkills(skill=skill, nuser_id=nuser.id)
                db.session.add(new_skill)

        db.session.commit()
        return jsonify({"success": "NUser profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in update_nuser: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@userdata_bp.route("/userdata", methods=["POST"])
@login_required
def register():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        class_year = data["class"]
        major = data["major"]
        currently_assigned = set(data["currentClasses"])
        completed_courses = set(data["previousCourses"])
        minerva_id = data.get("minervaID")
        minor = data.get("minor", None)

        # Check if the MinervaID already exists for another user
        if minerva_id:
            existing_user = Users.query.filter_by(minerva_id=minerva_id).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({"error": "MinervaID already in use"}), 409

        user = Users.query.filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        concentration = data.get("concentration", user.concentration)

        user.class_year = class_year
        user.major = major
        user.minerva_id = minerva_id
        user.concentration = concentration
        user.minor = minor

        # Remove current courses not in the new data
        for user_course in user.current_courses:
            if user_course.course.code not in currently_assigned:
                db.session.delete(user_course)

        # Add new current courses
        for current_course_code in currently_assigned:
            course = Courses.query.filter_by(code=current_course_code).first()
            if course:
                # Check if the course-user pair already exists
                if not UserCurrentCourses.query.filter_by(
                    user_id=current_user.id, course_id=course.id
                ).first():
                    user.current_courses.append(
                        UserCurrentCourses(
                            user_id=current_user.id, course_id=course.id,
                        )
                    )
            else:
                return (
                    jsonify({"error": f"Course {current_course_code} not found"}),
                    404,
                )

        # Remove completed courses not in the new data
        for user_completed_course in user.completed_courses:
            if user_completed_course.course.code not in completed_courses:
                db.session.delete(user_completed_course)

        # Add new completed courses
        for completed_course_code in completed_courses:
            course = Courses.query.filter_by(code=completed_course_code).first()
            if course:
                # Check if the course-user pair already exists
                if not UserCompletedCourses.query.filter_by(
                    user_id=current_user.id, course_id=course.id
                ).first():
                    user.completed_courses.append(
                        UserCompletedCourses(
                            user_id=current_user.id, course_id=course.id,
                        )
                    )
            else:
                return (
                    jsonify({"error": f"Course {completed_course_code} not found"}),
                    404,
                )

        db.session.commit()
        return jsonify({"success": "Profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in register: {e}")
        return jsonify({"error": str(e)}), 500


# endpoint to get user data for the update profile page
@userdata_bp.route("/view-userdata", methods=["GET"])
@login_required
def get_user_data():
    try:
        user = Users.query.filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "class": user.class_year,
            "major": user.major,
            "minervaID": user.minerva_id,
            "concentration": user.concentration,
            "minor": user.minor,
            "currentClasses": [course.course.code for course in user.current_courses],
            "previousCourses": [
                course.course.code for course in user.completed_courses
            ],
        }
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# endpoint to update user data for the update profile page
@userdata_bp.route("/update-user", methods=["PUT"])
@login_required
def update_user():
    try:
        data = request.get_json()
        user = Users.query.filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the MinervaID is being updated and if it already exists for another user
        new_minerva_id = data.get("minervaID")
        if new_minerva_id and new_minerva_id != user.minerva_id:
            existing_user = Users.query.filter_by(minerva_id=new_minerva_id).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "MinervaID already in use"}), 409

        # Update basic user data
        user.class_year = data.get("class", user.class_year)
        user.major = data.get("major", user.major)
        user.minerva_id = data.get("minervaID", user.minerva_id)
        user.concentration = data.get("concentration", user.concentration)
        user.minor = data.get("minor", user.minor)

        # Update current courses
        new_current_courses = set(data.get("currentClasses", []))

        # Remove old current courses
        for user_course in user.current_courses[:]:
            if (
                user_course.course is None
                or user_course.course.code not in new_current_courses
            ):
                db.session.delete(user_course)

        # Add new current courses
        for course_code in new_current_courses:
            if all(
                course_code != user_course.course.code
                for user_course in user.current_courses
                if user_course.course is not None
            ):
                course = Courses.query.filter_by(code=course_code).first()
                if course:
                    user.current_courses.append(
                        UserCurrentCourses(user_id=user.id, course_id=course.id)
                    )

        # Update previous courses
        new_previous_courses = set(data.get("previousCourses", []))

        # Remove old previous courses
        for user_completed_course in user.completed_courses[:]:
            if (
                user_completed_course.course is None
                or user_completed_course.course.code not in new_previous_courses
            ):
                db.session.delete(user_completed_course)

        # Add new previous courses
        for course_code in new_previous_courses:
            if all(
                course_code != user_completed_course.course.code
                for user_completed_course in user.completed_courses
                if user_completed_course.course is not None
            ):
                course = Courses.query.filter_by(code=course_code).first()
                if course:
                    user.completed_courses.append(
                        UserCompletedCourses(user_id=user.id, course_id=course.id)
                    )

        db.session.commit()
        return jsonify({"success": "Profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in update_user: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500
