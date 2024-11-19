import os
from dotenv import load_dotenv
from flask import Flask, make_response, jsonify
from flask_cors import CORS
from flask_login import LoginManager

from .blueprints.auth import auth_bp, oauth
from .blueprints.userdata import userdata_bp
from .blueprints.admin import admin_bp
from .blueprints.posts import posts_bp
from .models import NUsers, db
from .populate_db import main
import logging

load_dotenv()

login_manager = LoginManager()


def create_app(test_config=None):
    app = Flask(__name__)
    oauth.init_app(app)
    login_manager.init_app(app)

    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(userdata_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["https://minservice-94bfa.web.app", "http://localhost:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"],
            }
        },
        supports_credentials=True,
    )

    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True,
        SECRET_KEY=os.environ.get("SECRET_KEY"),
    )

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    login_manager.init_app(app)

    with app.app_context():
        db.create_all()
        if not app.config.get("TESTING"):
            main()

    @app.route("/")
    def index():
        return "Welcome to the backend!"

    @app.route("/<path:path>", methods=["OPTIONS"])
    def handle_global_options(path):
        return "", 200

    @login_manager.user_loader
    def load_user(user_id):
        return NUsers.query.get(user_id)

    @app.route("/api/test", methods=["GET"])
    def test():
        try:
            return jsonify("test")
        except Exception as e:
            app.logger.error(f"Unexpected error: {e}", exc_info=True)
            return make_response(jsonify({"error": "Internal Server Error"}), 500)

    return app
