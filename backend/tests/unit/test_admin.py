# tests/unit/test_admin.py
def test_admin_endpoint(client):
    # Assuming this route is protected and requires login
    response = client.get("/api/admin")
    assert response.status_code == 405
