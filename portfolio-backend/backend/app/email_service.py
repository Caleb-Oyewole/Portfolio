import logging
import smtplib
from email.message import EmailMessage

from .config import settings

log = logging.getLogger("mail")


def send_email(to: str, subject: str, body: str, reply_to: str | None = None) -> None:
    """Send a plain-text email. With no SMTP_HOST set, it is only logged (handy in dev)."""
    if not settings.smtp_host:
        log.warning("[email not sent - SMTP not configured] to=%s subject=%s\n%s", to, subject, body)
        return
    msg = EmailMessage()
    msg["From"] = settings.mail_from
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as s:
            s.starttls()
            if settings.smtp_user:
                s.login(settings.smtp_user, settings.smtp_password)
            s.send_message(msg)
    except Exception:
        log.exception("Failed to send email to %s", to)
