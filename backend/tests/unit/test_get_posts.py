# tests/unit/test_get_posts.py
from flask import url_for


def test_get_post(client, auth_user, create_post):
    post_id = create_post.id
    response = client.get(url_for("posts_bp.get_post", post_id=post_id))
    assert response.status_code == 200
    assert response.json["title"] == create_post.title
    assert response.json["author"] == create_post.author.name


def test_get_nonexistent_post(client, auth_user):
    response = client.get(url_for("posts_bp.get_post", post_id=9999))
    assert response.status_code == 404
    assert "error" in response.json


def test_get_posts(client, auth_user, create_posts):
    response = client.get(url_for("posts_bp.get_posts"))
    assert response.status_code == 200
    assert len(response.json) == len(create_posts)


def test_get_tags(client, auth_user, create_user_skills):
    response = client.get(url_for("posts_bp.get_tags"))
    assert response.status_code == 200
    assert "Python" in response.json
