# tests/unit/test_mail.py
from unittest.mock import patch, MagicMock, ANY
from API.blueprints.mail import send_email
import os


def test_send_email_success():
    with patch("API.blueprints.mail.smtplib.SMTP_SSL") as mock_smtp:
        # Create a mock for the server object
        mock_server = MagicMock()
        # Set the __enter__ method to return our mock_server
        mock_smtp.return_value.__enter__.return_value = mock_server

        # Set up return values for methods called on the server
        mock_server.login.return_value = True
        mock_server.sendmail.return_value = True

        # Set environment variables used in the function
        os.environ["SERVICE_EMAIL"] = "service@example.com"
        os.environ["SERVICE_EMAIL_PASSWORD"] = "password123"

        # Call the function under test
        send_email("test@example.com", "Test Subject", "Test Message")

        # Assert that sendmail was called as expected
        mock_server.sendmail.assert_called_once_with(
            os.environ.get("SERVICE_EMAIL"), "test@example.com", ANY
        )
