from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import db, Post, Comment

posts_bp = Blueprint("posts_bp", __name__)


@posts_bp.route("/posts", methods=["POST"])
@login_required
def add_post():
    try:
        # Get the data from the request
        data = request.get_json()

        # Validate required fields
        if (
            not data.get("type")
            or not data.get("credits")
            or not data.get("title")
            or not data.get("content")
        ):
            return jsonify({"error": "Missing required fields"}), 400

        # Create the new post
        new_post = Post(
            type=data["type"],  # 'type' (online/in-person)
            credits=int(data["credits"]),  # 'credits' (integer)
            title=data["title"],  # 'title'
            content=data["content"],  # 'content'
            author_id=current_user.id,  # Set the author to the current logged-in user
        )

        db.session.add(new_post)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": "Post added successfully",
                    "post": {
                        "id": new_post.id,
                        "title": new_post.title,
                        "content": new_post.content,
                        "credits": new_post.credits,
                        "serviceType": new_post.type,
                        "author": current_user.name,
                        "likes": new_post.likes,
                        "comments": [],
                        "timestamp": new_post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    },
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@login_required
def add_comment(post_id):
    try:
        data = request.get_json()
        new_comment = Comment(
            content=data["content"], post_id=post_id, author_id=current_user.id
        )
        db.session.add(new_comment)
        db.session.commit()
        return (
            jsonify(
                {
                    "success": "Comment added successfully",
                    "comment": {"content": new_comment.content},
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@login_required
def like_post(post_id):
    try:
        post = Post.query.get(post_id)
        if post:
            post.likes += 1
            db.session.commit()
            return jsonify({"success": "Post liked", "likes": post.likes}), 200
        return jsonify({"error": "Post not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # Ensure author exists and has a name
    author_name = post.author.name if post.author else "Unknown"

    post_data = {
        "id": post.id,
        "type": post.type,
        "credits": post.credits,
        "title": post.title,
        "content": post.content,
        "likes": post.likes,
        "comments": [
            {"id": comment.id, "content": comment.content} for comment in post.comments
        ],
        "author": author_name,  # Check if the author exists
        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        if post.timestamp
        else "Unknown",  # Safely handle timestamp
    }
    return jsonify(post_data), 200


@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    try:
        # Order posts by timestamp in descending order
        posts = Post.query.order_by(Post.timestamp.desc()).all()
        posts_data = [
            {
                "id": post.id,
                "type": post.type,
                "credits": post.credits,
                "title": post.title,
                "content": post.content,
                "likes": post.likes,
                "comments": [
                    {"id": comment.id, "content": comment.content}
                    for comment in post.comments
                ],
                "author": post.author.name,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                if post.timestamp
                else "Unknown",
            }
            for post in posts
        ]
        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
