"""Add last_login column to users table

Revision ID: e6f7a8b9c0d1
Revises: c5d6e7f8a9b0
Create Date: 2026-06-13 00:37:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6f7a8b9c0d1'
down_revision = 'c5d6e7f8a9b0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('users', 'last_login')