from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_child_or_404
from app.security import get_current_parent

router = APIRouter()


@router.post("", response_model=schemas.ChildRead, status_code=201)
def create_child(
    child: schemas.ChildCreate,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    db_child = models.Child(name=child.name, parent_id=parent.id)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child


@router.get("", response_model=List[schemas.ChildRead])
def get_children(
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    return db.query(models.Child).filter(models.Child.parent_id == parent.id).all()


@router.get("/{child_id}", response_model=schemas.ChildRead)
def get_child(
    child_id: int,
    db: Session = Depends(get_db),
    parent: models.Parent = Depends(get_current_parent),
):
    return get_owned_child_or_404(child_id, parent, db)
