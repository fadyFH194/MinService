# tests/unit/test_init.py

import pytest
from API import create_app


@pytest.fixture
def app():
    # Set up the Flask application with a test config
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # Use in-memory database for tests
        }
    )
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_create_app(client):
    """Test that the Flask app initializes correctly and the root endpoint works."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome to the backend!" in response.data


def test_test_route(client):
    """Test the /api/test route to ensure it returns 'test'."""
    response = client.get("/api/test")
    assert response.status_code == 200
    assert response.json == "test"
