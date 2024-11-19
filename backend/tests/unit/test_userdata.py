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
                "telegram": "TestTelegram",
                "whatsapp": "1234567890",
                "phone": "0987654321",
                "skills": ["Python", "Flask"],
            },
        )
        assert response.status_code == 201
        assert response.json["success"] == "NUser profile created/updated successfully"


def test_update_nuser(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.put(
            "/api/nusers-data",
            json={
                "name": "Updated User",
                "about": "Updated description",
                "classBatch": "2025",
                "currentLocation": "Updated City",
                "telegram": "UpdatedTelegram",
                "whatsapp": "9876543210",
                "phone": "1234567890",
                "skills": ["SQL", "React"],
            },
        )
        assert response.status_code == 201
        assert response.json["success"] == "NUser profile created/updated successfully"


def test_get_nuser_data(client, test_user):
    with patch("flask_login.utils._get_user", return_value=test_user):
        response = client.get("/api/nusers-view")
        assert response.status_code == 200
        data = response.json

        # Validate user data
        assert data["name"] == "Test User"
        assert data["email"] == test_user.email
        assert data["about"] == "This is a test user"
        assert data["classBatch"] == "2024"
        assert data["currentLocation"] == "Test City"
        assert data["telegram"] == "TestTelegram"
        assert data["whatsapp"] == "1234567890"
        assert data["phone"] == "0987654321"
        assert set(data["skills"]) == {"Python", "Flask"}

        # Validate credits
        assert data["credits"] == 5  # Assuming the initial credit is set to 5

        # Validate posts (empty for this test)
        assert isinstance(data["posts"], list)
        assert len(data["posts"]) == 0
