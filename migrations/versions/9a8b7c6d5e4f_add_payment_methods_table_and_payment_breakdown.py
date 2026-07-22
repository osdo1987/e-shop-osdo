"""add payment_methods table and payment_breakdown to cash_register_sessions

Revision ID: 9a8b7c6d5e4f
Revises: merge_a2b3_e1f2
Create Date: 2026-07-21 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '9a8b7c6d5e4f'
down_revision = 'merge_a2b3_e1f2'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('payment_methods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('is_cash', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    with op.batch_alter_table('cash_register_sessions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('payment_breakdown', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade():
    with op.batch_alter_table('cash_register_sessions', schema=None) as batch_op:
        batch_op.drop_column('payment_breakdown')

    op.drop_table('payment_methods')
