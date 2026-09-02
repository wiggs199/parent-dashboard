"""parent email_verified

Revision ID: 9821fa34191e
Revises: 283212607131
Create Date: 2026-09-02

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "9821fa34191e"
down_revision: Union[str, None] = "283212607131"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default so existing rows get a value; NOT NULL is then safe.
    op.add_column(
        "parents",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("parents", "email_verified")
