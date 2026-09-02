"""Reset a parent's password — for a trial user who is locked out.

There is no self-serve "forgot password" flow yet, so when someone can't
log in: run this, then send them the temporary password. They log in with
it (they're stuck with it until a real reset flow / change-password screen
exists — fine for a small trial).

    cd parent-dashboard-backend
    venv/bin/python scripts/reset_password.py their@email.com

Needs parent-dashboard-backend/.env.prod (gitignored) with a DATABASE_URL
line — the value from Render -> the API service -> Environment.
"""
import os
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).resolve().parent.parent / ".env.prod")

if len(sys.argv) != 2:
    sys.exit("Usage: python scripts/reset_password.py <email>")
if not os.getenv("DATABASE_URL"):
    sys.exit(
        "No DATABASE_URL. Create parent-dashboard-backend/.env.prod with the "
        "Neon connection string (see this file's docstring)."
    )

email = sys.argv[1].strip().lower()

from app import models  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.security import hash_password  # noqa: E402

alphabet = string.ascii_letters + string.digits
temp_password = "".join(secrets.choice(alphabet) for _ in range(14))

db = SessionLocal()
try:
    parent = db.query(models.Parent).filter(models.Parent.email == email).first()
    if not parent:
        sys.exit(f"No account with email {email!r}")
    parent.hashed_password = hash_password(temp_password)
    db.commit()
finally:
    db.close()

print(f"Password reset for {email}")
print(f"Temporary password: {temp_password}")
print("Send this to them over a channel only they can see. They log in with it.")
