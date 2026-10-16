"""Seed (or reset) the public demo account used by the landing page's
"Try the demo" button.

Fully fictional data — not the user's real son's real history. Named
Chase to match the actual brand story on the landing page, but every log
entry, contact, and note below is a generic stand-in, not a real record.

Safe to re-run any time the shared demo account gets messed up by a
visitor poking around — it deletes the existing demo parent (cascades to
the child/logs/documents) and recreates it clean.

    cd parent-dashboard-backend
    venv/bin/python scripts/seed_demo.py

Needs parent-dashboard-backend/.env.prod (gitignored) with DATABASE_URL —
same as the other admin scripts.
"""
import os
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).resolve().parent.parent / ".env.prod")

if not os.getenv("DATABASE_URL"):
    sys.exit(
        "No DATABASE_URL. Create parent-dashboard-backend/.env.prod with the "
        "Neon connection string (see this file's docstring)."
    )

import secrets  # noqa: E402

from app import models  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.security import hash_password  # noqa: E402

DEMO_EMAIL = "demo@antaripath.com"
DEMO_PASSWORD = "TryTheDemo2026"

today = date.today()


def days_ago(n):
    return today - timedelta(days=n)


LOGS = [
    (days_ago(28), "appointment", None, None, "Initial speech evaluation with the SLP."),
    (days_ago(25), "home_practice", "morning", 3,
     "Practiced /r/ sounds with flashcards, 10 minutes."),
    (days_ago(23), "home_practice", "evening", 4,
     "Read together and named pictures in the book."),
    (days_ago(20), "observation", None, None,
     "Used a 3-word sentence on his own at dinner for the first time."),
    (days_ago(18), "home_practice", "afternoon", 3, "Flashcards again, a little restless today."),
    (days_ago(14), "appointment", None, None,
     "Therapy session — working on blends. Homework: practice 'sp' and 'st' words."),
    (days_ago(11), "home_practice", "morning", 5, "Great session, asked to keep going."),
    (days_ago(7), "milestone", None, None,
     "Teacher mentioned he's raising his hand to answer more in class."),
    (days_ago(4), "home_practice", "evening", 4, "Practiced new words from speech homework."),
    (days_ago(1), "observation", None, 4, "Clearer speech noticed by grandma on a video call."),
]


def main():
    db = SessionLocal()
    try:
        existing = db.query(models.Parent).filter(models.Parent.email == DEMO_EMAIL).first()
        if existing:
            db.delete(existing)  # cascades to children -> logs/documents
            db.commit()

        parent = models.Parent(
            email=DEMO_EMAIL,
            name="Demo Parent",
            hashed_password=hash_password(DEMO_PASSWORD),
            email_verified=True,
        )
        db.add(parent)
        db.flush()  # get parent.id before creating the child

        child = models.Child(
            parent_id=parent.id,
            name="Chase",
            birth_year=today.year - 6,
            focus_areas=["Speech / Language"],
            profile_notes=(
                "This is a demo account anyone can log into from the "
                "AntAriPath homepage — feel free to click around. "
                "Nothing here is real; add, edit, or delete anything."
            ),
            handoff_helps=(
                "Give a few minutes' warning before switching activities. "
                "Picture cards help with choices. Loves dinosaurs."
            ),
            handoff_avoid="Loud, sudden noises — startles easily.",
            handoff_communication=(
                "Uses short phrases. Understands more than he says — give "
                "him time to answer before repeating the question."
            ),
            handoff_medical="No known allergies. No daily medication.",
            handoff_contacts=[
                {"name": "Demo Parent", "phone": "555-0100"},
            ],
            handoff_token=secrets.token_urlsafe(32),
        )
        db.add(child)
        db.flush()

        for log_date, log_type, time_of_day, mood, notes in LOGS:
            db.add(
                models.LogEntry(
                    child_id=child.id,
                    date=log_date,
                    type=log_type,
                    time_of_day=time_of_day,
                    mood_rating=mood,
                    notes=notes,
                )
            )

        db.commit()
        print(f"Demo account ready: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        print(f"Handoff card: /h/{child.handoff_token}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
