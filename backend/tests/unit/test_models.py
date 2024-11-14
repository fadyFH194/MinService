# tests/unit/test_models.py

import pytest
from API.models import db, NUsers, Roles, Post, Comment


@pytest.fixture
def app():
    from API import create_app

    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        }
    )
    with app.app_context():
        db.create_all()
        # Add default roles to test relationships
        user_role = Roles(name="user")
        admin_role = Roles(name="admin")
        db.session.add(user_role)
        db.session.add(admin_role)
        db.session.commit()
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def init_db(app):
    with app.app_context():
        # Add initial data to database
        yield db


def test_user_creation(init_db):
    """Test creating a user and assigning a role."""
    user_role = Roles.query.filter_by(name="user").first()
    user = NUsers(
        id="test_user", name="Test User", email="test@example.com", role_id=user_role.id
    )
    db.session.add(user)
    db.session.commit()

    fetched_user = NUsers.query.filter_by(id="test_user").first()
    assert fetched_user is not None
    assert fetched_user.role.name == "user"


def test_post_and_comment(init_db):
    """Test creating a post and adding a comment."""
    user = NUsers(
        id="test_user_2", name="Another User", email="another@example.com", role_id=1
    )
    db.session.add(user)
    db.session.commit()

    post = Post(
        type="online",
        credits=2,
        title="Test Post",
        content="Some content",
        author_id=user.id,
    )
    db.session.add(post)
    db.session.commit()

    comment = Comment(content="Test comment", post_id=post.id, author_id=user.id)
    db.session.add(comment)
    db.session.commit()

    fetched_post = db.session.get(Post, post.id)
    assert fetched_post is not None
    assert len(fetched_post.comments) == 1
    assert fetched_post.comments[0].content == "Test comment"
