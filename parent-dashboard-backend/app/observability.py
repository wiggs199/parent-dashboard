"""Sentry error monitoring.

No-op unless SENTRY_DSN is set, so local dev and the test suite never
send anything. Configured to avoid capturing personal data — this app
holds information about children.
"""
import sentry_sdk

from app.config import ENV, SENTRY_DSN


def _scrub(event, hint):
    """Drop request bodies and cookies before an event leaves the box."""
    req = event.get("request")
    if req:
        req.pop("data", None)
        req.pop("cookies", None)
        headers = req.get("headers") or {}
        for h in ("authorization", "cookie"):
            headers.pop(h, None)
    return event


def init_sentry() -> None:
    if not SENTRY_DSN:
        return
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENV,
        # Errors only — no performance tracing, keeps well inside the free quota.
        traces_sample_rate=0.0,
        # Never attach emails / IPs / usernames automatically.
        send_default_pii=False,
        before_send=_scrub,
    )
