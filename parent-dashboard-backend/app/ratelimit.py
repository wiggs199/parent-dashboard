"""Per-IP rate limiting for the auth endpoints (slowapi).

In-memory storage — fine for a single instance. If the API is ever scaled
to more than one instance, point `storage_uri` at Redis.
"""
from slowapi import Limiter
from starlette.requests import Request


def _client_ip(request: Request) -> str:
    # Render puts the real client IP first in X-Forwarded-For.
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_client_ip, default_limits=[])
