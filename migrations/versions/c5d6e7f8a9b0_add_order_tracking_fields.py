"""Add order tracking fields and status history

Revision ID: c5d6e7f8a9b0
Revises: b4c5d6e7f8a9
Create Date: 2026-06-08 23:16:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c5d6e7f8a9b0'
down_revision = 'b4c5d6e7f8a9'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to orders table
    op.add_column('orders', sa.Column('delivery_address', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('customer_notes', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('seller_notes', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('estimated_delivery', sa.DateTime(), nullable=True))
    op.add_column('orders', sa.Column('tracking_token', sa.String(64), nullable=True))
    op.create_index('ix_orders_tracking_token', 'orders', ['tracking_token'], unique=True)

    # Create order_status_history table
    op.create_table('order_status_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('old_status', sa.String(20), nullable=True),
        sa.Column('new_status', sa.String(20), nullable=False),
        sa.Column('changed_by', sa.String(100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('order_status_history')
    op.drop_index('ix_orders_tracking_token', table_name='orders')
    op.drop_column('orders', 'tracking_token')
    op.drop_column('orders', 'estimated_delivery')
    op.drop_column('orders', 'seller_notes')
    op.drop_column('orders', 'customer_notes')
    op.drop_column('orders', 'delivery_address')