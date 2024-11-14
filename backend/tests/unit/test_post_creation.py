# tests/unit/test_post_creation.py
import pytest
from flask import url_for


@pytest.fixture
def post_data():
    return {
        "type": "Request",
        "credits": 1,
        "title": "Need help with Python",
        "content": "Looking for Python expertise.",
        "tags": ["Python", "Help"],
    }


def test_add_post(client, post_data, auth_user):
    response = client.post(url_for("posts_bp.add_post"), json=post_data)
    assert response.status_code == 201
    assert response.json["success"] == "Post added successfully"


def test_add_post_invalid_data(client, auth_user):
    response = client.post(url_for("posts_bp.add_post"), json={})
    assert response.status_code == 400
    assert "error" in response.json


def test_edit_post(client, post_data, auth_user, create_post):
    post_id = create_post.id
    post_data["title"] = "Updated Title"
    response = client.put(
        url_for("posts_bp.edit_post", post_id=post_id), json=post_data
    )
    assert response.status_code == 200
    assert response.json["success"] == "Post updated successfully"
    assert response.json["post"]["title"] == "Updated Title"


def test_delete_post(client, auth_user, create_post):
    post_id = create_post.id
    response = client.delete(url_for("posts_bp.delete_post", post_id=post_id))
    assert response.status_code == 200
    assert response.json["success"] == "Post deleted successfully"
