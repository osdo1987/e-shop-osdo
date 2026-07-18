"""add_purchase_price_to_products

Revision ID: c3d4e5f6a7b8
Revises: f7bbaa8a7a48
Create Date: 2026-07-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'f7bbaa8a7a48'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price FLOAT')


def downgrade():
    op.drop_column('products', 'purchase_price')
