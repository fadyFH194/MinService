# conftest.py
import pytest
from sqlalchemy import event
from API import create_app, db
from API.models import NUsers, Roles, UserSkills, Post, Comment, Tag, PostLikes


@pytest.fixture
def app():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SERVER_NAME": "localhost",
        }
    )
    ctx = app.app_context()
    ctx.push()

    # Enable foreign key constraints in SQLite
    @event.listens_for(db.engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    db.create_all()
    yield app

    db.session.remove()
    db.drop_all()
    ctx.pop()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def setup_roles():
    db.session.add(Roles(name="user"))
    db.session.add(Roles(name="admin"))
    db.session.commit()


@pytest.fixture
def test_user(setup_roles):
    user_role = Roles.query.filter_by(name="user").first()
    user = NUsers(
        id="12345", name="Test User", email="test@example.com", role_id=user_role.id
    )
    db.session.add(user)
    db.session.commit()
    yield user


@pytest.fixture
def auth_user(client, test_user):
    with client.session_transaction() as session:
        session["_user_id"] = str(test_user.id)
    yield test_user


@pytest.fixture
def create_post(auth_user):
    post = Post(
        type="Request",
        credits=1,
        title="Help with Python",
        content="Looking for a Python expert",
        author_id=auth_user.id,
    )
    db.session.add(post)
    db.session.commit()
    yield post


@pytest.fixture
def create_comment(create_post, auth_user):
    comment = Comment(
        content="Great post!", post_id=create_post.id, author_id=auth_user.id
    )
    db.session.add(comment)
    db.session.commit()
    yield comment


@pytest.fixture
def create_user_skills(auth_user):
    skills = [
        UserSkills(skill="Django", nuser=auth_user),
        UserSkills(skill="Python", nuser=auth_user),
    ]
    db.session.add_all(skills)
    db.session.commit()
    yield skills
    for skill in skills:
        db.session.delete(skill)
    db.session.commit()


@pytest.fixture
def create_posts(auth_user):
    posts = [
        Post(
            type="Request",
            credits=1,
            title="Post 1",
            content="Content 1",
            author_id=auth_user.id,
        ),
        Post(
            type="Offer",
            credits=2,
            title="Post 2",
            content="Content 2",
            author_id=auth_user.id,
        ),
    ]
    db.session.add_all(posts)
    db.session.commit()
    yield posts
    for post in posts:
        db.session.delete(post)
    db.session.commit()


@pytest.fixture
def post_data():
    return {
        "type": "Request",
        "credits": 1,
        "title": "Help Needed",
        "content": "I need help with Flask development",
        "tags": ["Flask", "Python"],
    }


@pytest.fixture
def comment_data():
    return {"content": "This is a sample comment"}


@pytest.fixture
def like_post(create_post, auth_user):
    like = PostLikes(post_id=create_post.id, user_id=auth_user.id)
    db.session.add(like)
    db.session.commit()
    yield like
