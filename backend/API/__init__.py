import os
from dotenv import load_dotenv
from flask import Flask, make_response, jsonify, request
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
    
    # Initialize OAuth and Login Manager early
    oauth.init_app(app)
    login_manager.init_app(app)
    
    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)
    
    # Register blueprints under the "/api" prefix
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(userdata_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    
    # Enable CORS for specific API routes with credentials support
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "https://minservice-94bfa.web.app",
                    "http://localhost:5173",
                    "https://minservice-frontend-3a8073ee5a27.herokuapp.com"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"],
            }
        },
        supports_credentials=True,
    )
    
    # Application configuration
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True,
        SECRET_KEY=os.environ.get("SECRET_KEY"),
    )
    
    if test_config:
        app.config.update(test_config)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    with app.app_context():
        db.create_all()
        if not app.config.get("TESTING"):
            main()
    
    # Global after-request handler to ensure all responses include CORS headers
    @app.after_request
    def add_cors_headers(response):
        allowed_origins = [
            "https://minservice-94bfa.web.app",
            "http://localhost:5173",
            "https://minservice-frontend-3a8073ee5a27.herokuapp.com"
        ]
        origin = request.headers.get("Origin")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            # Fallback origin; adjust if needed.
            response.headers["Access-Control-Allow-Origin"] = "https://minservice-94bfa.web.app"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # Global handler for OPTIONS preflight requests (if not already handled)
    @app.route("/<path:path>", methods=["OPTIONS"])
    def handle_global_options(path):
        return "", 200

    @app.route("/")
    def index():
        return "Welcome to the backend!"

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
