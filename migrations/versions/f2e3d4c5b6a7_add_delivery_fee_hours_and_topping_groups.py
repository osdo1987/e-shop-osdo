"""Add delivery_fee, opening_time, closing_time to stores and topping_groups table

Revision ID: f2e3d4c5b6a7
Revises: 9a8b7c6d5e4f
Create Date: 2026-07-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'f2e3d4c5b6a7'
down_revision = '9a8b7c6d5e4f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('stores', sa.Column('delivery_fee', sa.Float(), nullable=True))
    op.add_column('stores', sa.Column('opening_time', sa.String(length=5), nullable=True))
    op.add_column('stores', sa.Column('closing_time', sa.String(length=5), nullable=True))

    op.create_table('topping_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('config', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('topping_groups')
    op.drop_column('stores', 'closing_time')
    op.drop_column('stores', 'opening_time')
    op.drop_column('stores', 'delivery_fee')
