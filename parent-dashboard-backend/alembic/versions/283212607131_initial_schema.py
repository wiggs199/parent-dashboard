"""initial schema

Revision ID: 283212607131
Revises:
Create Date: 2026-09-02

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "283212607131"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "parents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parents_email", "parents", ["email"], unique=True)
    op.create_index("ix_parents_id", "parents", ["id"])

    op.create_table(
        "children",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["parents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_children_id", "children", ["id"])
    op.create_index("ix_children_parent_id", "children", ["parent_id"])

    op.create_table(
        "logentries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("child_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("type", sa.String(), nullable=True),
        sa.Column("practiced_items", sa.Text(), nullable=True),
        sa.Column("mood_rating", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_logentries_id", "logentries", ["id"])
    op.create_index("ix_logentries_child_id", "logentries", ["child_id"])

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("child_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=True),
        sa.Column("filename", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_documents_id", "documents", ["id"])
    op.create_index("ix_documents_child_id", "documents", ["child_id"])

    op.create_table(
        "explorationtips",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("child_id", sa.Integer(), nullable=False),
        sa.Column("logentry_id", sa.Integer(), nullable=True),
        sa.Column("tip_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"]),
        sa.ForeignKeyConstraint(["logentry_id"], ["logentries.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_explorationtips_id", "explorationtips", ["id"])
    op.create_index("ix_explorationtips_child_id", "explorationtips", ["child_id"])


def downgrade() -> None:
    op.drop_table("explorationtips")
    op.drop_table("documents")
    op.drop_table("logentries")
    op.drop_table("children")
    op.drop_table("parents")
