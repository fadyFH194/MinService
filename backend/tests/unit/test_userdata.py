# tests/unit/test_userdata.py
from unittest.mock import patch


def test_create_or_update_nuser(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.post(
            "/api/nusers-data",
            json={
                "name": "Test User",
                "about": "This is a test user",
                "classBatch": "2024",
                "currentLocation": "Test City",
                "skills": ["Python", "Flask"],
            },
        )
        assert response.status_code == 201


def test_update_nuser(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.put(
            "/api/nusers-data",
            json={
                "name": "Updated User",
                "about": "Updated description",
                "classBatch": "2025",
                "currentLocation": "Updated City",
                "skills": ["SQL", "React"],
            },
        )
        assert response.status_code == 200


def test_get_nuser_data(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.get("/api/nusers-view")
        assert response.status_code == 200
        assert response.json["name"] == "Test User"
