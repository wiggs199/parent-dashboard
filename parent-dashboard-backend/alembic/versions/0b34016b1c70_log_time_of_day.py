"""log time_of_day

Revision ID: 0b34016b1c70
Revises: fc9ab4392d98
Create Date: 2026-09-09

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0b34016b1c70"
down_revision: Union[str, None] = "fc9ab4392d98"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("logentries", sa.Column("time_of_day", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("logentries", "time_of_day")
