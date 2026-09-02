"""Transactional email via Resend.

If RESEND_API_KEY is unset (local dev, tests), emails are logged instead of
sent — the verification / reset link shows up in the server output.
"""
import logging

import httpx

from app.config import EMAIL_FROM, FRONTEND_URL, RESEND_API_KEY

log = logging.getLogger("novapath.email")

_RESEND_ENDPOINT = "https://api.resend.com/emails"


def _send(to: str, subject: str, html: str) -> None:
    if not RESEND_API_KEY:
        log.warning("EMAIL (not sent — no RESEND_API_KEY)\n  to: %s\n  subject: %s\n  %s",
                    to, subject, html)
        return
    try:
        resp = httpx.post(
            _RESEND_ENDPOINT,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html},
            timeout=10,
        )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        # Don't fail the request the user made just because email is down.
        log.error("Failed to send email to %s: %s", to, exc)


def _shell(body: str) -> str:
    return (
        '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;'
        'max-width:520px;margin:0 auto;color:#333f3a;line-height:1.5">'
        f"{body}"
        '<p style="color:#97a09b;font-size:12px;margin-top:32px">'
        "NovaPath — an organizational support tool. Not therapy, diagnosis, or evaluation."
        "</p></div>"
    )


def _button(url: str, label: str) -> str:
    return (
        f'<p style="margin:24px 0"><a href="{url}" '
        'style="background:#5b8a78;color:#fff;text-decoration:none;padding:10px 18px;'
        'border-radius:8px;display:inline-block">' + label + "</a></p>"
        f'<p style="font-size:13px;color:#63706a">Or paste this link:<br>{url}</p>'
    )


def send_welcome_and_verify(to: str, name: str, verify_token: str) -> None:
    url = f"{FRONTEND_URL}/verify-email?token={verify_token}"
    greeting = f"Hi {name}," if name else "Hi,"
    _send(
        to,
        "Welcome to NovaPath — confirm your email",
        _shell(
            f"<p>{greeting}</p>"
            "<p>Your NovaPath account is ready. Confirm your email address so you can "
            "recover your account later if you need to.</p>"
            + _button(url, "Confirm email")
            + "<p>You can start using NovaPath right away — this just keeps your "
            "account recoverable.</p>"
        ),
    )


def send_verify(to: str, verify_token: str) -> None:
    url = f"{FRONTEND_URL}/verify-email?token={verify_token}"
    _send(
        to,
        "Confirm your NovaPath email",
        _shell("<p>Confirm your email address:</p>" + _button(url, "Confirm email")),
    )


def send_password_reset(to: str, reset_token: str) -> None:
    url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    _send(
        to,
        "Reset your NovaPath password",
        _shell(
            "<p>Someone asked to reset the password for this NovaPath account. "
            "If that was you, choose a new password:</p>"
            + _button(url, "Reset password")
            + "<p>This link expires in about an hour. If you didn't ask for this, "
            "you can ignore this email.</p>"
        ),
    )
