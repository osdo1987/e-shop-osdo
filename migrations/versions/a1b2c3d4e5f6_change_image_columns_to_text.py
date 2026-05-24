"""change image columns to text

Revision ID: a1b2c3d4e5f6
Revises: 8ff993019ef4
Create Date: 2026-05-24 03:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '8ff993019ef4'
branch_labels = None
depends_on = None


def upgrade():
    # Change stores.logo_url from VARCHAR(500) to TEXT
    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.alter_column('logo_url',
            existing_type=sa.String(length=500),
            type_=sa.Text(),
            existing_nullable=True
        )

    # Change products.image_url from VARCHAR(500) to TEXT
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.alter_column('image_url',
            existing_type=sa.String(length=500),
            type_=sa.Text(),
            existing_nullable=True
        )


def downgrade():
    # Revert stores.logo_url back to VARCHAR(500)
    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.alter_column('logo_url',
            existing_type=sa.Text(),
            type_=sa.String(length=500),
            existing_nullable=True
        )

    # Revert products.image_url back to VARCHAR(500)
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.alter_column('image_url',
            existing_type=sa.Text(),
            type_=sa.String(length=500),
            existing_nullable=True
        )
