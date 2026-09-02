"""Print usage counts from the database.

Run against production (Neon):

    cd parent-dashboard-backend
    DATABASE_URL='postgresql://...neon.tech/neondb?sslmode=require' \
        venv/bin/python scripts/stats.py

Get the DATABASE_URL from Render → the API service → Environment.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if not os.getenv("DATABASE_URL"):
    sys.exit("Set DATABASE_URL to the Neon connection string first (see this file's docstring).")

from sqlalchemy import create_engine, text  # noqa: E402

from app.config import DATABASE_URL  # noqa: E402

engine = create_engine(DATABASE_URL)

with engine.connect() as c:
    row = c.execute(
        text(
            """
            select
              (select count(*) from parents)                as parents,
              (select count(*) from children)               as children,
              (select count(*) from logentries)             as logs,
              (select count(*) from documents)              as documents,
              (select max(created_at) from parents)         as newest_signup,
              (select max(date) from logentries)            as last_log_date
            """
        )
    ).mappings().one()

    print("NovaPath — usage")
    print("-" * 32)
    for k, v in row.items():
        print(f"  {k:<14} {v}")

    print()
    print("Recent signups:")
    for p in c.execute(
        text("select email, created_at from parents order by created_at desc limit 10")
    ):
        print(f"  {p.created_at:%Y-%m-%d %H:%M}  {p.email}")

    print()
    print("Most recent logs:")
    for lg in c.execute(
        text(
            """
            select p.email, ch.name as child, l.date, l.type
            from logentries l
            join children ch on ch.id = l.child_id
            join parents p on p.id = ch.parent_id
            order by l.id desc limit 10
            """
        )
    ):
        print(f"  {lg.date}  {lg.type:<12} {lg.child} ({lg.email})")
