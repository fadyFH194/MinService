from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import db, Post, Comment, PostLikes, Tag, UserSkills
from datetime import timedelta
from .mail import send_email

posts_bp = Blueprint("posts_bp", __name__)


@posts_bp.route("/posts", methods=["POST"])
@login_required
def add_post():
    try:
        data = request.get_json()
        if (
            not data.get("type")
            or not isinstance(data.get("credits"), int)
            or data.get("credits") not in [0, 1, 2]
            or not data.get("title")
            or not data.get("content")
        ):
            return jsonify({"error": "Missing or invalid required fields"}), 400

        # Create a new post
        new_post = Post(
            type=data["type"],
            credits=int(data["credits"]),
            title=data["title"],
            content=data["content"],
            author_id=current_user.id,
        )

        # Add tags to the post if provided
        tag_names = data.get("tags", [])
        tags = []
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            tags.append(tag)

        new_post.tags = tags
        db.session.add(new_post)
        db.session.commit()

        # Find users whose skills match the post's tags
        matching_skills = UserSkills.query.filter(UserSkills.skill.in_(tag_names)).all()
        notified_users = set()

        for user_skill in matching_skills:
            profile_owner = user_skill.nuser
            if profile_owner.email and profile_owner.id not in notified_users:
                notified_users.add(profile_owner.id)
                try:
                    send_email(
                        to_email=profile_owner.email,
                        subject=f"New Request for Help on MinService",
                        message=f"Hello {profile_owner.name},\n\n"
                        f"{current_user.name} asked for help with task '{new_post.title}' that is {new_post.type}, and based on your profile, you might be able to help.\n"
                        f"Check it out on MinService.\n\n"
                        f"Best regards,\nMinService",
                    )
                except Exception as e:
                    app.logger.error(
                        f"Failed to send email to {profile_owner.email}: {e}"
                    )

        return (
            jsonify(
                {
                    "success": "Post added successfully",
                    "post": {
                        "id": new_post.id,
                        "title": new_post.title,
                        "content": new_post.content,
                        "credits": new_post.credits,
                        "type": new_post.type,
                        "author": current_user.name,
                        "author_id": current_user.id,
                        "likes": 0,
                        "comments": [],
                        "date": new_post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        "author_picture": current_user.picture
                        if current_user.picture
                        else None,
                        "tags": [tag.name for tag in new_post.tags],
                    },
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in add_post: {e}")
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
                    "id": new_comment.id,
                    "content": new_comment.content,
                    "author": current_user.name,
                    "author_id": current_user.id,
                    "author_picture": current_user.picture
                    if current_user.picture
                    else None,
                    "timestamp": new_comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                }
            ),
            201,
        )
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

        if comment.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        new_content = data.get("content")
        if not new_content:
            return jsonify({"error": "No content provided"}), 400

        comment.content = new_content
        db.session.commit()

        return (
            jsonify(
                {
                    "success": "Comment updated successfully",
                    "comment": {
                        "id": comment.id,
                        "content": comment.content,
                        "author": comment.author.name,
                        "author_id": comment.author_id,
                        "author_picture": comment.author.picture
                        if comment.author.picture
                        else None,
                        "timestamp": comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    },
                }
            ),
            200,
        )
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

        if post.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

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

        if post.author_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        post.title = data.get("title", post.title)
        post.content = data.get("content", post.content)
        post.type = data.get("type", post.type)
        post.credits = data.get("credits", post.credits)

        # Update tags
        tag_names = data.get("tags", [])
        tags = []
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            tags.append(tag)

        post.tags = tags
        db.session.commit()

        total_likes = PostLikes.query.filter_by(post_id=post.id).count()

        return (
            jsonify(
                {
                    "success": "Post updated successfully",
                    "post": {
                        "id": post.id,
                        "title": post.title,
                        "content": post.content,
                        "credits": post.credits,
                        "type": post.type,
                        "author": post.author.name,
                        "author_id": post.author_id,
                        "likes": total_likes,
                        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        "author_picture": post.author.picture
                        if post.author.picture
                        else None,
                        "tags": [tag.name for tag in post.tags],
                    },
                }
            ),
            200,
        )
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

        existing_like = PostLikes.query.filter_by(
            post_id=post_id, user_id=current_user.id
        ).first()

        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            has_liked = False
        else:
            new_like = PostLikes(post_id=post_id, user_id=current_user.id)
            db.session.add(new_like)
            db.session.commit()
            has_liked = True

        total_likes = PostLikes.query.filter_by(post_id=post_id).count()

        return (
            jsonify(
                {"success": "Post updated", "likes": total_likes, "hasLiked": has_liked}
            ),
            200,
        )
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

    total_likes = PostLikes.query.filter_by(post_id=post.id).count()

    post_data = {
        "id": post.id,
        "type": post.type,
        "credits": post.credits,
        "title": post.title,
        "content": post.content,
        "likes": total_likes,
        "author": post.author.name,
        "author_id": post.author_id,
        "author_picture": post.author.picture if post.author.picture else None,
        "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        if post.timestamp
        else "Unknown",
        "tags": [tag.name for tag in post.tags],
        "comments": [
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.author.name,
                "author_picture": comment.author.picture
                if comment.author.picture
                else None,
                "timestamp": comment.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "author_id": comment.author_id,
            }
            for comment in post.comments
        ],
    }
    return jsonify(post_data), 200


@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    try:
        posts = Post.query.all()

        posts_sorted = sorted(
            posts,
            key=lambda p: p.timestamp
            + timedelta(days=PostLikes.query.filter_by(post_id=p.id).count()),
            reverse=True,
        )

        posts_data = [
            {
                "id": post.id,
                "type": post.type,
                "credits": post.credits,
                "title": post.title,
                "content": post.content,
                "likes": PostLikes.query.filter_by(post_id=post.id).count(),
                "comments": [
                    {"id": comment.id, "content": comment.content}
                    for comment in post.comments
                ],
                "author": post.author.name,
                "author_id": post.author_id,
                "author_picture": post.author.picture if post.author.picture else None,
                "date": post.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                if post.timestamp
                else "Unknown",
                "tags": [tag.name for tag in post.tags],
            }
            for post in posts_sorted
        ]

        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@posts_bp.route("/tags", methods=["GET"])
def get_tags():
    try:
        # Query the UserSkills table to get unique skill names
        skills = db.session.query(UserSkills.skill).distinct().all()

        # Extract skill names from the query result
        skill_tags = [
            skill[0] for skill in skills
        ]  # skills is a list of tuples (skill_name,)

        return jsonify(skill_tags), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
