from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app import auth
from app.config import CORS_ORIGINS, SENTRY_DSN, assert_production_config
from app.observability import init_sentry
from app.ratelimit import limiter
from app.routes import children, documents, exploration_tips, logs

# Refuse to start on an unsafe production configuration (dev secret / no DB).
assert_production_config()

# Error monitoring — no-op without SENTRY_DSN. Must run before the app is built.
init_sentry()

# Schema is managed by Alembic — run `alembic upgrade head` (locally and as
# the Render pre-deploy command). No create_all here.

app = FastAPI(title="NovaPath API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth.router)
app.include_router(children.router, prefix="/children", tags=["Children"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(exploration_tips.router, prefix="/explorationtips", tags=["Exploration Tips"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


# Deliberate error, for confirming Sentry is wired up. Only exists when
# Sentry is configured; requires a valid login so it can't be spammed.
if SENTRY_DSN:
    from app.models import Parent  # noqa: E402
    from app.security import get_current_parent  # noqa: E402
    from fastapi import Depends  # noqa: E402

    @app.get("/debug/sentry-test", include_in_schema=False)
    def _sentry_test(parent: Parent = Depends(get_current_parent)):
        raise RuntimeError("Sentry test error — ignore, this is intentional.")
