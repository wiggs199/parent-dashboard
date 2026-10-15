"""The public, unauthenticated side of the handoff card.

A parent generates a link from the authenticated API (see
POST /children/:id/handoff-link in routes/children.py); this route is what
that link actually opens — no login, for a sitter, substitute teacher, or
anyone else a parent hands it to.

Deliberately narrow: HandoffRead only ever exposes what the parent typed
specifically for this card (see schemas.HandoffRead) — never logs,
documents, focus_areas, profile_notes, or the token itself.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.ratelimit import limiter

router = APIRouter()


@router.get("/{token}", response_model=schemas.HandoffRead)
@limiter.limit("30/hour")
def get_handoff_card(request: Request, token: str, db: Session = Depends(get_db)):
    child = (
        db.query(models.Child).filter(models.Child.handoff_token == token).first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="This link isn't valid.")
    return child
