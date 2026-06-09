"""Add business_type, address, schedule to stores

Revision ID: b4c5d6e7f8a9
Revises: a1b2c3d4e5f6
Create Date: 2026-06-08 14:28:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b4c5d6e7f8a9'
down_revision = 'b05e674416c2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('stores', sa.Column('business_type', sa.String(20), nullable=False, server_default='store'))
    op.add_column('stores', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('stores', sa.Column('schedule', sa.String(200), nullable=True))


def downgrade():
    op.drop_column('stores', 'schedule')
    op.drop_column('stores', 'address')
    op.drop_column('stores', 'business_type')