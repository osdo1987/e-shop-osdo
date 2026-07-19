"""create images table and migrate image data

Revision ID: d1e2f3a4b5c6
Revises: f7bbaa8a7a48
Create Date: 2026-07-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import hashlib
import base64
import os

revision = 'd1e2f3a4b5c6'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create images table
    op.create_table('images',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('hash', sa.String(64), unique=True, nullable=False, index=True),
        sa.Column('extension', sa.String(10), nullable=False),
        sa.Column('mime_type', sa.String(50), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('original_name', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # 2. Add image_id FK to products
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_products_image_id', 'images', ['image_id'], ['id'])

    # 3. Add logo_id FK to stores
    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.add_column(sa.Column('logo_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_stores_logo_id', 'images', ['logo_id'], ['id'])

    # 4. Migrate product image_url data to images table
    conn = op.get_bind()
    conn.execute(sa.text("""
        INSERT INTO images (hash, extension, mime_type, size, original_name, created_at)
        SELECT
            encode(sha256(image_url::bytea), 'hex') AS hash,
            CASE
                WHEN image_url LIKE '%.png' THEN 'png'
                WHEN image_url LIKE '%.webp' THEN 'webp'
                WHEN image_url LIKE '%.gif' THEN 'gif'
                WHEN image_url LIKE '%.avif' THEN 'avif'
                ELSE 'jpg'
            END AS extension,
            'image/jpeg' AS mime_type,
            length(image_url) AS size,
            image_url AS original_name,
            NOW() AS created_at
        FROM products
        WHERE image_url IS NOT NULL
          AND image_url != ''
          AND image_url NOT LIKE 'blob:%'
          AND image_url LIKE '/uploads/%'
    """))

    # 5. Update product.image_id from the migrated images
    conn.execute(sa.text("""
        UPDATE products
        SET image_id = (
            SELECT i.id FROM images i
            WHERE i.original_name = products.image_url
            LIMIT 1
        )
        WHERE image_url IS NOT NULL
          AND image_url != ''
          AND image_url NOT LIKE 'blob:%'
          AND image_url LIKE '/uploads/%'
    """))

    # 6. Migrate store logo_url data (base64 data URLs) to images table
    conn.execute(sa.text("""
        INSERT INTO images (hash, extension, mime_type, size, original_name, created_at)
        SELECT
            encode(sha256(logo_url::bytea), 'hex') AS hash,
            CASE
                WHEN logo_url LIKE 'data:image/png%' THEN 'png'
                WHEN logo_url LIKE 'data:image/webp%' THEN 'webp'
                WHEN logo_url LIKE 'data:image/gif%' THEN 'gif'
                WHEN logo_url LIKE 'data:image/avif%' THEN 'avif'
                ELSE 'jpg'
            END AS extension,
            CASE
                WHEN logo_url LIKE 'data:image/png%' THEN 'image/png'
                WHEN logo_url LIKE 'data:image/webp%' THEN 'image/webp'
                WHEN logo_url LIKE 'data:image/gif%' THEN 'image/gif'
                WHEN logo_url LIKE 'data:image/avif%' THEN 'image/avif'
                ELSE 'image/jpeg'
            END AS mime_type,
            length(logo_url) AS size,
            'logo' AS original_name,
            NOW() AS created_at
        FROM stores
        WHERE logo_url IS NOT NULL
          AND logo_url != ''
          AND logo_url LIKE 'data:image/%'
    """))

    # 7. Update store.logo_id from the migrated images
    conn.execute(sa.text("""
        UPDATE stores
        SET logo_id = (
            SELECT i.id FROM images i
            WHERE i.original_name = 'logo'
              AND encode(sha256(stores.logo_url::bytea), 'hex') = i.hash
            LIMIT 1
        )
        WHERE logo_url IS NOT NULL
          AND logo_url != ''
          AND logo_url LIKE 'data:image/%'
    """))

    # 8. Drop old columns
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_column('image_url')

    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.drop_column('logo_url')


def downgrade():
    # Re-add old columns
    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.add_column(sa.Column('logo_url', sa.Text(), nullable=True))

    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.Text(), nullable=True))

    # Migrate data back from images to old columns
    conn = op.get_bind()
    conn.execute(sa.text("""
        UPDATE products
        SET image_url = '/uploads/' || i.hash || '.' || i.extension
        FROM images i
        WHERE products.image_id = i.id
    """))

    conn.execute(sa.text("""
        UPDATE stores
        SET logo_url = '/uploads/' || i.hash || '.' || i.extension
        FROM images i
        WHERE stores.logo_id = i.id
    """))

    # Drop FKs
    with op.batch_alter_table('stores', schema=None) as batch_op:
        batch_op.drop_constraint('fk_stores_logo_id', type_='foreignkey')
        batch_op.drop_column('logo_id')

    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_constraint('fk_products_image_id', type_='foreignkey')
        batch_op.drop_column('image_id')

    op.drop_table('images')
