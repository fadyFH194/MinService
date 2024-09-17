from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()


class Roles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class NUsers(db.Model, UserMixin):
    __tablename__ = "nusers"
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100))
    about = db.Column(db.String(255))
    class_batch = db.Column(db.String(100))
    current_location = db.Column(db.String(100))
    skills = db.relationship("UserSkills", backref="nuser", lazy=True)

    # Dynamically set default role_id to the "user" role
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    role = db.relationship("Roles", backref="nusers", lazy=True)

    def __init__(self, *args, **kwargs):
        if "role_id" not in kwargs:
            user_role = Roles.query.filter_by(name="user").first()  # Fetch "user" role
            kwargs["role_id"] = user_role.id  # Set the role_id to the user role
        super(NUsers, self).__init__(*args, **kwargs)


class UserSkills(db.Model):
    __tablename__ = "user_skills"
    id = db.Column(db.Integer, primary_key=True)
    skill = db.Column(db.String(100))
    nuser_id = db.Column(db.String, db.ForeignKey("nusers.id"), nullable=False)


class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    comments = db.relationship("Comment", backref="post", lazy=True)
    author_id = db.Column(db.String, db.ForeignKey("nusers.id"), nullable=False)

    # Add timestamp field
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with NUsers (author)
    author = db.relationship("NUsers", backref="posts", lazy=True)


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    author_id = db.Column(db.String, db.ForeignKey("nusers.id"), nullable=False)


# the InitializationFlag model
class InitializationFlag(db.Model):
    __tablename__ = "initialization_flag"
    id = db.Column(db.Integer, primary_key=True)
    is_initialized = db.Column(db.Boolean, default=False)
