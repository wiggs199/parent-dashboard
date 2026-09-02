from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import auth
from app.config import CORS_ORIGINS, assert_production_config
from app.routes import children, documents, exploration_tips, logs

# Refuse to start on an unsafe production configuration (dev secret / no DB).
assert_production_config()

# Schema is managed by Alembic — run `alembic upgrade head` (locally and as
# the Render pre-deploy command). No create_all here.

app = FastAPI(title="NovaPath API")

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
