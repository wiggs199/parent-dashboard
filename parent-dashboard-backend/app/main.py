from fastapi import FastAPI, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os

from app import models, schemas
from app.database import engine, get_db, Base

from typing import List
from fastapi import HTTPException

from fastapi import FastAPI
from app.routes import children, logs, documents, exploration_tips

app = FastAPI()

app.include_router(children.router, prefix="/children", tags=["Children"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(exploration_tips.router, prefix="/explorationtips", tags=["Exploration Tips"])

# -----------------------------
# Create database tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# Initialize app
# -----------------------------
app = FastAPI(title="Parent Dashboard MVP")

# -----------------------------
# Upload directory
# -----------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------------------
# Child Endpoints
# -----------------------------
@app.post("/children", response_model=schemas.ChildRead)
def create_child(child: schemas.ChildCreate, db: Session = Depends(get_db)):
    db_child = models.Child(name=child.name)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

@app.get("/children", response_model=List[schemas.ChildRead])
def list_children(db: Session = Depends(get_db)):
    return db.query(models.Child).all()

# -----------------------------
# LogEntry Endpoints
# -----------------------------
@app.post("/logentries", response_model=schemas.LogEntryRead)
def create_logentry(
    logentry: schemas.LogEntryCreate,
    db: Session = Depends(get_db)
):
    db_log = models.LogEntry(
        child_id=logentry.child_id,
        date=logentry.date,
        type=logentry.type,
        practiced_items=logentry.practiced_items,
        mood_rating=logentry.mood_rating,
        notes=logentry.notes
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/logentries", response_model=List[schemas.LogEntryRead])
def list_logentries(db: Session = Depends(get_db)):
    return db.query(models.LogEntry).all()

# -----------------------------
# Document Endpoints
# -----------------------------
@app.post("/documents/upload", response_model=schemas.DocumentRead)
async def upload_document(
    child_id: int,
    type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file locally
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Create DB record
    db_doc = models.Document(
        child_id=child_id,
        type=type,
        filename=file.filename
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@app.get("/documents", response_model=List[schemas.DocumentRead])
def list_documents(db: Session = Depends(get_db)):
    return db.query(models.Document).all()

# -----------------------------
# Exploration Endpoints
# -----------------------------

@app.post("/explorationtips", response_model=schemas.ExplorationTipRead)
def create_exploration_tip(
    tip: schemas.ExplorationTipCreate,
    db: Session = Depends(get_db)
):
    # Check child exists
    child = db.query(models.Child).filter(models.Child.id == tip.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Optional: check logentry exists if provided
    if tip.logentry_id:
        log = db.query(models.LogEntry).filter(models.LogEntry.id == tip.logentry_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="LogEntry not found")

    db_tip = models.ExplorationTip(
        child_id=tip.child_id,
        logentry_id=tip.logentry_id,
        tip_text=tip.tip_text
    )
    db.add(db_tip)
    db.commit()
    db.refresh(db_tip)
    return db_tip

@app.get("/explorationtips", response_model=List[schemas.ExplorationTipRead])
def list_exploration_tips(db: Session = Depends(get_db)):
    return db.query(models.ExplorationTip).all()

