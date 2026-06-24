"""Add toppings_config to products and selected_toppings to order_items

Revision ID: f1a2b3c4d5e6
Revises: e6f7a8b9c0d1
Create Date: 2026-06-23 23:58:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'e6f7a8b9c0d1'
branch_labels = None
depends_on = None


def upgrade():
    # Add toppings_config to products table
    op.add_column('products', sa.Column('toppings_config', sa.Text(), nullable=True))
    
    # Add selected_toppings and extra_price to order_items table
    op.add_column('order_items', sa.Column('selected_toppings', sa.Text(), nullable=True))
    op.add_column('order_items', sa.Column('extra_price', sa.Float(), nullable=False, server_default='0'))


def downgrade():
    op.drop_column('products', 'toppings_config')
    op.drop_column('order_items', 'selected_toppings')
    op.drop_column('order_items', 'extra_price')