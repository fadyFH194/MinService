from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from flask_cors import CORS

admin_bp = Blueprint("admin_bp", __name__)
CORS(admin_bp, supports_credentials=True, origins=["http://localhost:5173"])
