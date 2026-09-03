"""child profile fields

Revision ID: 54a92a1c0319
Revises: 9821fa34191e
Create Date: 2026-09-03

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "54a92a1c0319"
down_revision: Union[str, None] = "9821fa34191e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("children", sa.Column("birth_year", sa.Integer(), nullable=True))
    op.add_column(
        "children",
        sa.Column("focus_areas", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column("children", sa.Column("profile_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("children", "profile_notes")
    op.drop_column("children", "focus_areas")
    op.drop_column("children", "birth_year")
