# auth.py

from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user
from ..models import Users, db
from authlib.integrations.flask_client import OAuth
import os
from flask_cors import CORS

auth_bp = Blueprint("auth_bp", __name__)
CORS(auth_bp, supports_credentials=True, resources={r"/*": {"origins": "*"}})


oauth = OAuth()

google = oauth.register(
    name="google",
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    access_token_url="https://accounts.google.com/o/oauth2/token",
    access_token_params=None,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params=None,
    api_base_url="https://www.googleapis.com/oauth2/v1/",
    client_kwargs={"scope": "openid profile email"},
)


@auth_bp.route("/google/", methods=["POST"])
def login():
    # Parse JSON from the incoming request
    data = request.get_json()

    # Extract the necessary information from the JSON
    user_id = data.get("sub")  # Use 'sub' as the user ID
    given_name = data.get("given_name")
    picture = data.get("picture")

    # Check if all required information is present
    if not all([user_id, given_name, picture]):
        return jsonify({"error": "Missing data in the provided JSON"}), 400

    # Check if the user already exists in the database
    user = Users.query.filter_by(id=user_id).first()
    if not user:
        # If the user doesn't exist, create a new user entry
        user = Users(id=user_id, given_name=given_name, picture=picture)
        db.session.add(user)
        db.session.commit()
        new_user = True  # Flag to indicate a new user has been created
    else:
        new_user = False  # Existing user, no new user created

    # Log in the user using Flask-Login
    login_user(user)

    # Return the user information and a success message
    return jsonify({
        "user": {
            "id": user_id,
            "given_name": given_name,
            "picture": picture,
            "new_user": new_user,
            # Ensure the user model has a 'role' attribute or handle it appropriately
            "role": user.role.name if hasattr(user, 'role') else 'default_role'
        },
        "message": "Login successful"
    }), 200


@auth_bp.route("/auth/logout", methods=["POST"])
@login_required
def logout():
    try:
        # Attempt to log out the user
        logout_user()

        # Return a success message if logout is successful
        return jsonify({"message": "Logout successful"}), 200

    except Exception as e:
        # Log the error or handle it as needed
        # print(e)  # For debugging, optionally log the exception to the console

        # Return an error message if something goes wrong
        return jsonify({"error": "Logout failed", "details": str(e)}), 500
