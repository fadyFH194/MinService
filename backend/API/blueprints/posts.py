from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import db, Post, Comment, PostLikes

posts_bp = Blueprint("posts_bp", __name__)

@posts_bp.route("/posts", methods=["POST"])
@login_required
def add_post():
    try:
        data = request.get_json()
        if not data.get("type") or not isinstance(data.get("credits"), int) or data.get("credits") not in [0, 1, 2] or not data.get("title") or not data.get("content"):
            return jsonify({"error": "Missing or invalid required fields"}), 400
    

        new_post = Post(
            type=data["type"],
            credits=int(data["credits"]),
            title=data["title"],
            content=data["content"],
            author_id=current_user.id
        )

        db.session.add(new_post)
        db.session.commit()

        return jsonify({
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
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@login_required
def add_comment(post_id):
    try:
        data = request.get_json()
        new_comment = Comment(content=data["content"], post_id=post_id, author_id=current_user.id)
        db.session.add(new_comment)
        db.session.commit()

        return jsonify({
            "success": "Comment added successfully",
            "comment": {"content": new_comment.content}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@login_required
def like_post(post_id):
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Check if the current user has already liked the post
        existing_like = PostLikes.query.filter_by(post_id=post_id, user_id=current_user.id).first()

        if existing_like:
            # If the user has already liked the post, remove their like
            db.session.delete(existing_like)
            db.session.commit()
        else:
            # If the user has not liked the post, add a new like
            new_like = PostLikes(post_id=post_id, user_id=current_user.id)
            db.session.add(new_like)
            db.session.commit()

        # Recalculate total likes after the like/unlike action
        total_likes = PostLikes.query.filter_by(post_id=post_id).count()

        return jsonify({"success": "Post updated", "likes": total_likes}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@posts_bp.route("/posts/<int:post_id>/has_liked", methods=["GET"])
@login_required
def has_liked(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    liked = PostLikes.query.filter_by(post_id=post_id, user_id=current_user.id).first()
    total_likes = PostLikes.query.filter_by(post_id=post_id).count()

    return jsonify({"hasLiked": liked is not None, "likes": total_likes}), 200


@posts_bp.route("/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    author_name = post.author.name if post.author else "Unknown"

    post_data = {
        "id": post.id,
        "type": post.type,
        "credits": post.credits,
        "title": post.title,
        "content": post.content,
        "likes": post.likes,
        "comments": [{"id": comment.id, "content": comment.content} for comment in post.comments],
        "author": author_name,
        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown"
    }
    return jsonify(post_data), 200


@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    try:
        posts = Post.query.order_by(Post.timestamp.desc()).all()
        posts_data = [
            {
                "id": post.id,
                "type": post.type,
                "credits": post.credits,
                "title": post.title,
                "content": post.content,
                "likes": post.likes,
                "comments": [{"id": comment.id, "content": comment.content} for comment in post.comments],
                "author": post.author.name,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown",
            }
            for post in posts
        ]
        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500