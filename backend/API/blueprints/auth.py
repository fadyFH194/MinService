from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user
from ..models import NUsers, db
from authlib.integrations.flask_client import OAuth
import os
from flask_cors import CORS

auth_bp = Blueprint("auth_bp", __name__)
CORS(auth_bp, supports_credentials=True)

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


@auth_bp.route("/auth/google", methods=["POST"])
def login():
    data = request.get_json()
    access_token = data.get("access_token")

    google = oauth.create_client("google")

    resp = google.get("userinfo", token=access_token)
    user_info = resp.json()

    user_id = user_info["id"]
    given_name = user_info["given_name"]
    email = user_info["email"]  # Extract email from user_info
    picture = user_info["picture"]

    user = NUsers.query.filter_by(id=user_id).first()

    if not user:
        # If the user doesn't exist, create a new user and store the picture URL and email
        user = NUsers(
            id=user_id,
            name=given_name,
            email=email,  # Store the user's email
            picture=picture,  # Store the picture URL in the database
        )
        db.session.add(user)
        db.session.commit()
        new_user = True
    else:
        # If the user exists, update the picture URL, email, and name if necessary
        user.name = given_name
        user.email = email  # Update the email in case it has changed
        user.picture = picture  # Update the picture URL in case it has changed
        db.session.commit()
        new_user = False

    login_user(user)
    session["profile"] = resp.json()

    return (
        jsonify(
            {
                "user": {
                    "id": user_id,
                    "given_name": given_name,
                    "email": email,  # Include email in the response
                    "picture": picture,
                    "new_user": new_user,
                    "role": user.role.name,
                },
                "message": "Login successful",
            }
        ),
        200,
    )


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
