"""add manage_stock to products

Revision ID: a2b3c4d5e6f7
Revises: f7bbaa8a7a48
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

revision = 'a2b3c4d5e6f7'
down_revision = 'f7bbaa8a7a48'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('products', sa.Column('manage_stock', sa.Boolean(), nullable=False, server_default='true'))

def downgrade():
    op.drop_column('products', 'manage_stock')
