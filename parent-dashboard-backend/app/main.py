from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import children, logs, documents, exploration_tips

# -----------------------------
# Create database tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# App
# -----------------------------
app = FastAPI(title="Parent Dashboard MVP")

# Allow the Vite dev server to call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(children.router, prefix="/children", tags=["Children"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(exploration_tips.router, prefix="/explorationtips", tags=["Exploration Tips"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
