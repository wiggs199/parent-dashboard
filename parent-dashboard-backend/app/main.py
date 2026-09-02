from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import auth
from app.config import CORS_ORIGINS, assert_production_config
from app.database import Base, engine
from app.routes import children, documents, exploration_tips, logs

# Refuse to start with the dev secret when ENV says this is not dev.
assert_production_config()

# -----------------------------
# Create database tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# App
# -----------------------------
app = FastAPI(title="Parent Dashboard MVP")

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
