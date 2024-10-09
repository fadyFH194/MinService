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
                "type": new_post.type,  # Changed from 'serviceType' to 'type'
                "author": current_user.name,
                "author_id": current_user.id,  # Include author_id
                "likes": 0,  # New post starts with 0 likes
                "comments": [],
                "date": new_post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "author_picture": current_user.picture if current_user.picture else None
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
            # Return the entire comment object with all necessary fields
            "id": new_comment.id,
            "content": new_comment.content,
            "author": current_user.name,
            "author_id": current_user.id,
            "author_picture": current_user.picture if current_user.picture else None,
            "timestamp": new_comment.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@posts_bp.route("/comments/<int:comment_id>/edit", methods=["PUT"])
@login_required
def edit_comment(comment_id):
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Only allow the comment's author to edit it
        if comment.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        # Get updated data from the request
        data = request.get_json()
        new_content = data.get("content")
        if not new_content:
            return jsonify({"error": "No content provided"}), 400

        # Update the comment
        comment.content = new_content
        db.session.commit()

        # Return the updated comment data
        return jsonify({
            "success": "Comment updated successfully",
            "comment": {
                "id": comment.id,
                "content": comment.content,
                "author": comment.author.name,
                "author_id": comment.author_id,
                "author_picture": comment.author.picture if comment.author.picture else None,
                "timestamp": comment.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


    
@posts_bp.route("/posts/<int:post_id>/delete", methods=["DELETE"])
@login_required
def delete_post(post_id):
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Ensure that only the author can delete the post
        if post.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        # Delete associated likes and comments
        Comment.query.filter_by(post_id=post_id).delete()
        PostLikes.query.filter_by(post_id=post_id).delete()
        db.session.delete(post)
        db.session.commit()

        return jsonify({"success": "Post deleted successfully"}), 200
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
    
    
@posts_bp.route("/posts/<int:post_id>/edit", methods=["PUT"])
@login_required
def edit_post(post_id):
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Ensure that only the author can edit the post
        if post.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        # Get updated data from the request
        data = request.get_json()

        # Update the post fields (only if provided)
        post.title = data.get("title", post.title)
        post.content = data.get("content", post.content)
        post.type = data.get("type", post.type)
        post.credits = data.get("credits", post.credits)

        # Commit changes to the database
        db.session.commit()

        # Recalculate total likes after editing
        total_likes = PostLikes.query.filter_by(post_id=post.id).count()

        # Return the updated post data
        return jsonify({
            "success": "Post updated successfully",
            "post": {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "credits": post.credits,
                "type": post.type,  # Changed from 'serviceType' to 'type'
                "author": post.author.name,
                "author_id": post.author_id,  # Include author_id
                "likes": total_likes,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "author_picture": post.author.picture if post.author.picture else None
            }
        }), 200
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
            has_liked = False
        else:
            # If the user has not liked the post, add a new like
            new_like = PostLikes(post_id=post_id, user_id=current_user.id)
            db.session.add(new_like)
            db.session.commit()
            has_liked = True

        # Recalculate total likes after the like/unlike action
        total_likes = PostLikes.query.filter_by(post_id=post_id).count()

        return jsonify({"success": "Post updated", "likes": total_likes, "hasLiked": has_liked}), 200
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

    # Calculate total likes dynamically
    total_likes = PostLikes.query.filter_by(post_id=post.id).count()

    post_data = {
        "id": post.id,
        "type": post.type,
        "credits": post.credits,
        "title": post.title,
        "content": post.content,
        "likes": total_likes,
        "author": post.author.name,
        "author_id": post.author_id,  # Include author_id
        "author_picture": post.author.picture if post.author.picture else None,  # Author's picture
        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown",
        "comments": [
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.author.name,
                "author_picture": comment.author.picture if comment.author.picture else None,  # Comment author's picture from NUsers
                "timestamp": comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "author_id": comment.author_id  # Include author_id for comments
            } for comment in post.comments
        ]
    }
    return jsonify(post_data), 200



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
                "author_id": post.author_id,
                "author_picture": post.author.picture if post.author.picture else None,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S") if post.timestamp else "Unknown",
            }
            for post in posts_sorted
        ]

        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500