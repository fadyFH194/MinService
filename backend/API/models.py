from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
import logging

db = SQLAlchemy()


class Roles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class NUsers(db.Model, UserMixin):
    __tablename__ = "nusers"
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(
        db.String(120), unique=True, nullable=False
    )  # Email retrieved directly
    picture = db.Column(db.String(255))  # Profile picture URL
    about = db.Column(db.String(255))
    class_batch = db.Column(db.String(100))
    current_location = db.Column(db.String(100))
    telegram = db.Column(db.String(100))  # New field for Telegram
    whatsapp = db.Column(db.String(100))  # New field for WhatsApp
    phone = db.Column(db.String(20))  # New field for Phone

    skills = db.relationship("UserSkills", backref="nuser", lazy=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    role = db.relationship("Roles", backref="nusers", lazy=True)
    user_credits = db.relationship("UserCredits", back_populates="nuser", uselist=False)

    def __init__(self, *args, **kwargs):
        if "role_id" not in kwargs:
            user_role = Roles.query.filter_by(name="user").first()
            kwargs["role_id"] = user_role.id
        super(NUsers, self).__init__(*args, **kwargs)


class UserCredits(db.Model):
    __tablename__ = "user_credits"
    id = db.Column(db.Integer, primary_key=True)
    nuser_id = db.Column(
        db.String, db.ForeignKey("nusers.id"), nullable=False, unique=True
    )
    credits = db.Column(db.Integer, default=5)

    nuser = db.relationship("NUsers", back_populates="user_credits")


# Set up logging
logging.basicConfig()
logger = logging.getLogger(__name__)


@event.listens_for(NUsers, "after_insert")
def create_user_credits(mapper, connection, target):
    logger.info(f"Creating UserCredits for new user with ID {target.id}")
    # Correctly pass parameters as a dictionary
    connection.execute(
        UserCredits.__table__.insert(), {"nuser_id": target.id, "credits": 5}
    )


class UserSkills(db.Model):
    __tablename__ = "user_skills"
    id = db.Column(db.Integer, primary_key=True)
    skill = db.Column(db.String(100))
    nuser_id = db.Column(db.String, db.ForeignKey("nusers.id"), nullable=False)


class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    # Establishing the many-to-many relationship with Post through PostTags
    posts = db.relationship("Post", secondary="post_tags", back_populates="tags")


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
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship("NUsers", backref="posts", lazy=True)

    # Relationship for many-to-many association with tags
    tags = db.relationship("Tag", secondary="post_tags", back_populates="posts")


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(
        db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False
    )
    author_id = db.Column(
        db.String(100), db.ForeignKey("nusers.id", ondelete="CASCADE"), nullable=False
    )
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # Add timestamp field

    # Relationship with NUsers (author)
    author = db.relationship("NUsers", backref="comments", lazy=True)


class PostLikes(db.Model):
    __tablename__ = "post_likes"
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(
        db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False
    )
    user_id = db.Column(
        db.String(100), db.ForeignKey("nusers.id", ondelete="CASCADE"), nullable=False
    )

    post = db.relationship("Post", backref="post_likes", lazy=True)
    user = db.relationship("NUsers", backref="user_likes", lazy=True)


class PostTags(db.Model):
    __tablename__ = "post_tags"
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey("tags.id"), primary_key=True)


class InitializationFlag(db.Model):
    __tablename__ = "initialization_flag"
    id = db.Column(db.Integer, primary_key=True)
    is_initialized = db.Column(db.Boolean, default=False)
