from pathlib import Path
from typing import List
from urllib.parse import quote
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas, storage
from app.config import MAX_UPLOAD_BYTES
from app.database import get_db
from app.deps import get_owned_child_or_404, get_owned_document_or_404
from app.security import get_current_parent

router = APIRouter()

_CATEGORIES = {"therapist", "school", "insurance", "other"}


def _require_child_basics(child: models.Child) -> None:
    if child.birth_year is None or not child.focus_areas:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Add {child.name}'s birth year and at least one focus area on their "
                "profile before uploading documents."
            ),
        )


@router.post("", response_model=schemas.DocumentRead, status_code=201)
def upload_document(
    child_id: int = Form(...),
    category: str = Form("other"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    child = get_owned_child_or_404(child_id, parent, db)
    _require_child_basics(child)

    if category not in _CATEGORIES:
        raise HTTPException(status_code=422, detail="Unknown category")

    # size check without trusting any header
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size == 0:
        raise HTTPException(status_code=422, detail="The file is empty.")
    if size > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"Files must be {mb} MB or smaller.")

    original_name = Path(file.filename or "upload").name
    key = f"child/{child_id}/{uuid.uuid4().hex}_{original_name}"
    storage.put(key, file.file, file.content_type)

    doc = models.Document(
        child_id=child_id,
        category=category,
        filename=original_name,
        storage_key=key,
        content_type=file.content_type,
        size_bytes=size,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/child/{child_id}", response_model=List[schemas.DocumentRead])
def list_documents(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    get_owned_child_or_404(child_id, parent, db)
    return (
        db.query(models.Document)
        .filter(models.Document.child_id == child_id)
        .order_by(models.Document.uploaded_at.desc(), models.Document.id.desc())
        .all()
    )


@router.get("/{doc_id}/download")
def download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    doc = get_owned_document_or_404(doc_id, parent, db)
    disposition = f"attachment; filename*=UTF-8''{quote(doc.filename)}"
    return StreamingResponse(
        storage.open_stream(doc.storage_key),
        media_type=doc.content_type or "application/octet-stream",
        headers={"Content-Disposition": disposition},
    )


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    doc = get_owned_document_or_404(doc_id, parent, db)
    storage.delete(doc.storage_key)
    db.delete(doc)
    db.commit()
