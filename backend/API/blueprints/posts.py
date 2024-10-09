from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import db, Post, Comment, PostLikes
from datetime import timedelta

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
        new_comment = Comment(
            content=data["content"],
            post_id=post_id,
            author_id=current_user.id  # Associate comment with current user
        )
        db.session.add(new_comment)
        db.session.commit()

        return jsonify({
            "success": "Comment added successfully",
            "comment": {
                "id": new_comment.id,
                "content": new_comment.content,
                "author": current_user.name,  # Return comment owner
                "timestamp": new_comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),  # Return formatted timestamp
                "author_id": current_user.id  # Include author ID for ownership checks
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@posts_bp.route("/comments/<int:comment_id>/delete", methods=["DELETE"])
@login_required
def delete_comment(comment_id):
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Only allow the comment's author to delete it
        if comment.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        db.session.delete(comment)
        db.session.commit()
        return jsonify({"success": "Comment deleted"}), 200
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

    post_data = {
        "id": post.id,
        "type": post.type,
        "credits": post.credits,
        "title": post.title,
        "content": post.content,
        "likes": post.likes,
        "author": post.author.name,
        "author_picture": post.author.picture if post.author.picture else None,  # Author's picture
        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown",
        "comments": [
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.author.name,
                "author_picture": comment.author.picture if comment.author.picture else None,  # Comment author's picture from NUsers
                "timestamp": comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "author_id": comment.author_id
            } for comment in post.comments
        ]
    }
    return jsonify(post_data), 200


from datetime import timedelta

@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    try:
        # Fetch all posts
        posts = Post.query.all()

        # Calculate likes dynamically from the PostLikes table and sort posts
        posts_sorted = sorted(
            posts,
            key=lambda p: p.timestamp + timedelta(days=PostLikes.query.filter_by(post_id=p.id).count()),
            reverse=True
        )

        # Create the list of post data to return, preserving the sorted order
        posts_data = [
            {
                "id": post.id,
                "type": post.type,
                "credits": post.credits,
                "title": post.title,
                "content": post.content,
                "likes": PostLikes.query.filter_by(post_id=post.id).count(),
                "comments": [{"id": comment.id, "content": comment.content} for comment in post.comments],
                "author": post.author.name,
                "author_picture": post.author.picture if post.author.picture else None,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown",
            }
            for post in posts_sorted
        ]

        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500