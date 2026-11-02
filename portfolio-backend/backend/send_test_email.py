"""Check that your email setup really delivers. Run from backend/ with your venv active:

    python send_test_email.py you@example.com

Unlike the website (which logs email failures quietly), this prints the real error.
"""
import sys

from app import email_service as es
from app.config import settings

if len(sys.argv) != 2:
    sys.exit("Usage: python send_test_email.py destination@example.com")
to = sys.argv[1]

if es.mail_cfg.brevo_api_key:
    how, send = "Brevo API", es._send_brevo
elif settings.smtp_host:
    how, send = f"SMTP {settings.smtp_host}:{settings.smtp_port}", es._send_smtp
else:
    sys.exit("No email provider configured. Set BREVO_API_KEY (recommended) or SMTP_HOST in .env, then restart.")

print(f"Sending via {how} from {settings.mail_from} to {to} ...")
try:
    send(to, "Test email from your portfolio backend", "If you can read this, subscription emails will work.", None)
except Exception as e:  # noqa: BLE001
    sys.exit(f"FAILED: {e}")
print("Sent. Check the inbox (and the spam folder).")
