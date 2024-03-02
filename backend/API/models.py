from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(
        db.String(120), unique=True, nullable=True
    )  # Some users might not use Google auth
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Add additional fields as necessary

    def serialize(self):
        return {
            "id": self.id,
            "google_id": self.google_id,
            "username": self.username,
            "email": self.email,
            # Add other fields as necessary
        }
