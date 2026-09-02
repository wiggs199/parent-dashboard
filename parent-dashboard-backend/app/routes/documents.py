from pathlib import Path
from typing import List
import shutil
import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_child_or_404
from app.security import get_current_parent

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("", response_model=schemas.DocumentRead, status_code=201)
def upload_document(
    child_id: int,
    type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)

    # Never trust the client-supplied name for the path on disk.
    original_name = Path(file.filename or "upload").name
    stored_name = f"{uuid.uuid4().hex}_{original_name}"
    with open(UPLOAD_DIR / stored_name, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_doc = models.Document(child_id=child_id, type=type, filename=stored_name)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


@router.get("/child/{child_id}", response_model=List[schemas.DocumentRead])
def get_documents(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)
    return db.query(models.Document).filter(models.Document.child_id == child_id).all()
