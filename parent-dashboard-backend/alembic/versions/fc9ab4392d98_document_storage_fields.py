"""document storage fields

Revision ID: fc9ab4392d98
Revises: 54a92a1c0319
Create Date: 2026-09-03

The documents table has never held rows (upload was never functional), so
this replaces the old `type` column outright.
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "fc9ab4392d98"
down_revision: Union[str, None] = "54a92a1c0319"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "documents",
        sa.Column("category", sa.String(), nullable=False, server_default="other"),
    )
    op.add_column(
        "documents",
        sa.Column("storage_key", sa.String(), nullable=False, server_default=""),
    )
    op.add_column("documents", sa.Column("content_type", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("size_bytes", sa.Integer(), nullable=True))
    op.add_column("documents", sa.Column("uploaded_at", sa.DateTime(), nullable=True))
    with op.batch_alter_table("documents") as b:
        b.alter_column("filename", existing_type=sa.String(), nullable=False)
        b.drop_column("type")


def downgrade() -> None:
    op.add_column("documents", sa.Column("type", sa.String(), nullable=True))
    with op.batch_alter_table("documents") as b:
        b.alter_column("filename", existing_type=sa.String(), nullable=True)
    op.drop_column("documents", "uploaded_at")
    op.drop_column("documents", "size_bytes")
    op.drop_column("documents", "content_type")
    op.drop_column("documents", "storage_key")
    op.drop_column("documents", "category")
