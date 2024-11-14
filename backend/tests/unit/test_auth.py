# tests/unit/test_auth.py
from unittest.mock import patch, MagicMock


def test_login_success(client, setup_roles):
    with patch("API.blueprints.auth.oauth.create_client") as mock_oauth:
        mock_google = MagicMock()
        mock_oauth.return_value = mock_google
        mock_google.get.return_value.json.return_value = {
            "id": "12345",
            "given_name": "John",
            "email": "john@example.com",
            "picture": "http://example.com/pic.jpg",
        }

        response = client.post("/api/auth/google", json={"access_token": "mock_token"})
        assert response.status_code == 200
        assert response.json["user"]["id"] == "12345"
        assert response.json["user"]["given_name"] == "John"
        assert response.json["user"]["email"] == "john@example.com"
        assert response.json["user"]["picture"] == "http://example.com/pic.jpg"


def test_logout_success(client, test_user):
    with client.session_transaction() as sess:
        sess["_user_id"] = test_user.id

    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json["message"] == "Logout successful"
