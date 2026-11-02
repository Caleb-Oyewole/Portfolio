import logging
import smtplib
from email.message import EmailMessage
from email.utils import parseaddr

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict

from .config import settings

log = logging.getLogger("mail")


class MailSettings(BaseSettings):
    """Optional HTTP email provider (Brevo). Read from .env like everything else."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    brevo_api_key: str = ""


mail_cfg = MailSettings()


def _send_brevo(to: str, subject: str, body: str, reply_to: str | None) -> None:
    # Brevo sends over HTTPS (port 443), so it works on hosts that block SMTP ports
    # (Render's free tier does). MAIL_FROM must be a sender you verified in Brevo.
    name, address = parseaddr(settings.mail_from)
    payload = {
        "sender": {"email": address, **({"name": name} if name else {})},
        "to": [{"email": to}],
        "subject": subject,
        "textContent": body,
    }
    if reply_to:
        payload["replyTo"] = {"email": reply_to}
    r = httpx.post(
        "https://api.brevo.com/v3/smtp/email",
        json=payload,
        headers={"api-key": mail_cfg.brevo_api_key, "accept": "application/json"},
        timeout=20,
    )
    if r.status_code >= 300:
        raise RuntimeError(f"Brevo rejected the email ({r.status_code}): {r.text[:300]}")


def _send_smtp(to: str, subject: str, body: str, reply_to: str | None) -> None:
    msg = EmailMessage()
    msg["From"] = settings.mail_from
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as s:
        s.starttls()
        if settings.smtp_user:
            s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)


def send_email(to: str, subject: str, body: str, reply_to: str | None = None) -> None:
    """Send a plain-text email.

    Order: Brevo API (BREVO_API_KEY) -> SMTP (SMTP_HOST) -> just log it (handy in dev).
    """
    if not mail_cfg.brevo_api_key and not settings.smtp_host:
        log.warning("[email not sent - no email provider configured] to=%s subject=%s\n%s", to, subject, body)
        return
    try:
        if mail_cfg.brevo_api_key:
            _send_brevo(to, subject, body, reply_to)
        else:
            _send_smtp(to, subject, body, reply_to)
    except Exception:
        log.exception("Failed to send email to %s", to)
