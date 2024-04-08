from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import db, CoursesAvailableForPickup, Courses
from flask_cors import CORS

admin_bp = Blueprint("admin_bp", __name__)
CORS(admin_bp, supports_credentials=True, origins=["http://localhost:5173"])
