# tests/unit/test_post_interactions.py
import pytest
from flask import url_for


@pytest.fixture
def comment_data():
    return {"content": "Great post!"}


def test_like_post(client, auth_user, create_post):
    post_id = create_post.id
    response = client.post(url_for("posts_bp.like_post", post_id=post_id))
    assert response.status_code == 200
    assert response.json["success"] == "Post updated"
    assert response.json["likes"] == 1
    assert response.json["hasLiked"] is True


def test_unlike_post(client, auth_user, create_post, like_post):
    post_id = create_post.id
    response = client.post(url_for("posts_bp.like_post", post_id=post_id))
    assert response.status_code == 200
    assert response.json["likes"] == 0
    assert response.json["hasLiked"] is False


def test_add_comment(client, auth_user, create_post, comment_data):
    post_id = create_post.id
    response = client.post(
        url_for("posts_bp.add_comment", post_id=post_id), json=comment_data
    )
    assert response.status_code == 201
    assert response.json["success"] == "Comment added successfully"
    assert response.json["content"] == comment_data["content"]


def test_edit_comment(client, auth_user, create_comment):
    comment_id = create_comment.id
    new_content = {"content": "Updated Comment"}
    response = client.put(
        url_for("posts_bp.edit_comment", comment_id=comment_id), json=new_content
    )
    assert response.status_code == 200
    assert response.json["success"] == "Comment updated successfully"
    assert response.json["comment"]["content"] == "Updated Comment"


def test_delete_comment(client, auth_user, create_comment):
    comment_id = create_comment.id
    response = client.delete(url_for("posts_bp.delete_comment", comment_id=comment_id))
    assert response.status_code == 200
    assert response.json["success"] == "Comment deleted"
