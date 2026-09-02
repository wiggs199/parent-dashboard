from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import shutil
import uuid

from app import models, schemas
from app.database import get_db

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# Upload document
@router.post("", response_model=schemas.DocumentRead)
def upload_document(
    child_id: int,
    type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Never trust the client-supplied name for the path on disk.
    original_name = Path(file.filename or "upload").name
    stored_name = f"{uuid.uuid4().hex}_{original_name}"
    file_path = UPLOAD_DIR / stored_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_doc = models.Document(child_id=child_id, type=type, filename=stored_name)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


# Get documents for a child
@router.get("/child/{child_id}", response_model=List[schemas.DocumentRead])
def get_documents(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.Document).filter(models.Document.child_id == child_id).all()
