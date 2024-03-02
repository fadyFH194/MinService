# __init__.py

import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from .blueprints.auth import auth_bp

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()


def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    # Set configuration from environment variables
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///mydatabase.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "mysecretkey")

    # Enable CORS for all domains on all routes
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE"],
            }
        },
        supports_credentials=True,
    )

    app.register_blueprint(auth_bp, url_prefix="/auth")

    # Initialize extensions
    db.init_app(app)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Define a simple route to welcome users
    @app.route("/")
    def index():
        return "Welcome to the backend!"

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
