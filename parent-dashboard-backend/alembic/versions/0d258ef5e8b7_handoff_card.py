"""handoff card fields

Revision ID: 0d258ef5e8b7
Revises: 0b34016b1c70
Create Date: 2026-10-15

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0d258ef5e8b7"
down_revision: Union[str, None] = "0b34016b1c70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("children", sa.Column("handoff_helps", sa.Text(), nullable=True))
    op.add_column("children", sa.Column("handoff_avoid", sa.Text(), nullable=True))
    op.add_column("children", sa.Column("handoff_communication", sa.Text(), nullable=True))
    op.add_column("children", sa.Column("handoff_medical", sa.Text(), nullable=True))
    op.add_column(
        "children",
        sa.Column("handoff_contacts", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column("children", sa.Column("handoff_token", sa.String(), nullable=True))
    op.create_index(
        "ix_children_handoff_token", "children", ["handoff_token"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_children_handoff_token", table_name="children")
    op.drop_column("children", "handoff_token")
    op.drop_column("children", "handoff_contacts")
    op.drop_column("children", "handoff_medical")
    op.drop_column("children", "handoff_communication")
    op.drop_column("children", "handoff_avoid")
    op.drop_column("children", "handoff_helps")
