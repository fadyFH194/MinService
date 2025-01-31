# tests/unit/test_userdata.py
from unittest.mock import patch
import pytest
from API.models import db, NUsers, Post, Roles


@pytest.fixture
def setup_roles():
    """
    Populate the Roles table with a default 'user' role for testing.
    """
    user_role = Roles(name="user")
    db.session.add(user_role)
    db.session.commit()
    return user_role


@pytest.fixture
def test_user(setup_roles):
    """
    Create a mock user for testing.
    """
    user = NUsers(
        id="test_user_id",
        name="Test User",
        email="testuser@example.com",
        about="This is a test user",
        class_batch="2024",
        current_location="Test City",
        telegram="@test_user",
        whatsapp="+123456789",
        phone="555-555-5555",
        role_id=setup_roles.id,  # Assign the 'user' role
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def test_post(test_user):
    """
    Create a mock post associated with the test user.
    """
    post = Post(
        title="Test Post",
        content="This is a test post content",
        credits=5,
        type="request",
        likes=0,
        author_id=test_user.id,
    )
    db.session.add(post)
    db.session.commit()
    return post


@pytest.fixture
def client(app):
    """
    Create a test client for Flask.
    """
    app.testing = True
    with app.test_client() as client:
        yield client


def test_create_or_update_nuser_post(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.post(
            "/api/nusers-data",
            json={
                "name": "Test User",
                "about": "This is a test user",
                "classBatch": "2024",
                "currentLocation": "Test City",
                "telegram": "@test_user",
                "whatsapp": "+123456789",
                "phone": "555-555-5555",
                "skills": ["Python", "Flask"],
            },
        )
        assert response.status_code == 201
        assert response.json["success"] == "NUser profile created/updated successfully"


def test_get_nuser_data(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.get("/api/nusers-view")
        assert response.status_code == 200
        data = response.json
        assert data["name"] == "Test User"
        assert data["email"] == test_user.email
        assert data["about"] == "This is a test user"
        assert data["classBatch"] == "2024"
        assert data["currentLocation"] == "Test City"
        assert data["telegram"] == "@test_user"
        assert data["whatsapp"] == "+123456789"
        assert data["phone"] == "555-555-5555"
        assert data["credits"] == 0  # Initial credits for a new user


def test_create_or_update_nuser_put(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.put(
            "/api/nusers-data",
            json={
                "name": "Updated User",
                "about": "Updated description",
                "classBatch": "2025",
                "currentLocation": "Updated City",
                "telegram": "@updated_user",
                "whatsapp": "+987654321",
                "phone": "111-111-1111",
                "skills": ["SQL", "React"],
            },
        )
        assert response.status_code == 201
        assert response.json["success"] == "NUser profile created/updated successfully"


def test_get_nuser_data_with_posts(client, test_user, test_post):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.get("/api/nusers-view")
        assert response.status_code == 200
        data = response.json
        assert "posts" in data
        assert len(data["posts"]) == 1
        assert data["posts"][0]["title"] == test_post.title
        assert data["posts"][0]["content"] == test_post.content
        assert data["posts"][0]["credits"] == test_post.credits
        assert data["posts"][0]["type"] == test_post.type
        assert data["posts"][0]["likes"] == test_post.likes
