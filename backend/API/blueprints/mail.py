from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import os
import logging

logger = logging.getLogger(__name__)


def send_email(to_email, subject, message):
    try:
        from_email = os.environ.get("SERVICE_EMAIL")
        app_password = os.environ.get("SERVICE_EMAIL_PASSWORD")

        if not from_email or not app_password:
            raise ValueError("Service email or password not configured.")

        # Create a MIME message object
        msg = MIMEMultipart()
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject

        # Set the email body with UTF-8 encoding
        msg.attach(MIMEText(message, "plain", "utf-8"))

        # Send the email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(from_email, app_password)
            server.sendmail(from_email, to_email, msg.as_string())

        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
