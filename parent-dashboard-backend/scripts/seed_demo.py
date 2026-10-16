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

The sample document is uploaded through the real, live API (login, then
POST /documents) rather than written to storage directly from here. This
script runs on a local machine with no R2 credentials in its environment,
so a direct storage.put() call would silently fall back to local disk
instead of the R2 bucket the live API actually reads from -- the DB row
would look right while the file itself quietly went nowhere real. Going
through the API is slower but is the only way from here that's guaranteed
to land the bytes wherever the live app actually stores them.
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

import io
import secrets  # noqa: E402

import httpx  # noqa: E402

from app import models  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.security import hash_password  # noqa: E402

DEMO_EMAIL = "demo@antaripath.com"
DEMO_PASSWORD = "TryTheDemo2026"
DEMO_DOCUMENT_FILENAME = "Chase - IEP Excerpt (Sample).pdf"

API_BASE_URL = os.getenv("API_BASE_URL", "https://parent-dashboard-api.onrender.com")

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


def _make_sample_iep_pdf() -> bytes:
    """A one-page fake IEP excerpt -- plausible enough that the AI
    extraction feature has real goals/dates/services to find, clearly
    labeled as a sample so nobody mistakes it for a real document."""
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=LETTER,
        leftMargin=0.9 * inch, rightMargin=0.9 * inch,
        topMargin=0.9 * inch, bottomMargin=0.9 * inch,
    )
    h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=14, spaceAfter=4)
    label = ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=10, spaceBefore=12, spaceAfter=4)
    body = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=14, spaceAfter=4)
    sample = ParagraphStyle("sample", fontName="Helvetica-Oblique", fontSize=9, textColor="#a33", spaceAfter=10)

    review_date = (today.replace(year=today.year + 1)).strftime("%B %-d, %Y")

    flow = [
        Paragraph("Individualized Education Program (IEP) &mdash; Excerpt", h1),
        Paragraph("SAMPLE DOCUMENT &mdash; fictional, for demo purposes only. Not a real record.", sample),
        Paragraph("Student", label),
        Paragraph("Chase (Demo)", body),
        Paragraph("Annual Review Date", label),
        Paragraph(review_date, body),
        Paragraph("Present Levels of Performance", label),
        Paragraph(
            "Chase is working on increasing intelligible speech in conversational "
            "settings and expanding expressive vocabulary.", body,
        ),
        Paragraph("Annual Goals", label),
        Paragraph(
            "1. By the next annual review, Chase will produce age-appropriate "
            "speech sounds in conversation with 80% accuracy, as measured by "
            "SLP observation.", body,
        ),
        Paragraph(
            "2. Chase will use 4&ndash;5 word sentences to communicate wants and "
            "needs in the classroom setting, in 8 of 10 observed opportunities.", body,
        ),
        Paragraph("Services", label),
        Paragraph(
            "Speech-Language Therapy &mdash; 60 minutes/week, individual session, "
            "provided by the school's Speech-Language Pathologist.", body,
        ),
        Paragraph("Classroom accommodation: visual schedule support.", body),
        Paragraph("Case Manager", label),
        Paragraph("Ms. Rivera, Special Education Coordinator", body),
    ]
    doc.build(flow)
    return buf.getvalue()


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

        child_id = child.id
        handoff_token = child.handoff_token
        db.commit()
        print(f"Demo account ready: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        print(f"Handoff card: /h/{handoff_token}")

        # Upload the sample document through the real API (see module
        # docstring for why -- a direct storage.put() from here would miss
        # the live R2 bucket entirely).
        pdf_bytes = _make_sample_iep_pdf()
        with httpx.Client(base_url=API_BASE_URL, timeout=30) as http:
            login = http.post(
                "/auth/login", data={"username": DEMO_EMAIL, "password": DEMO_PASSWORD}
            )
            login.raise_for_status()
            token = login.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            upload = http.post(
                "/documents",
                data={"child_id": str(child_id), "category": "school"},
                files={"file": (DEMO_DOCUMENT_FILENAME, io.BytesIO(pdf_bytes), "application/pdf")},
                headers=headers,
            )
            upload.raise_for_status()
            print(f"Sample document uploaded via the live API: {DEMO_DOCUMENT_FILENAME}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
