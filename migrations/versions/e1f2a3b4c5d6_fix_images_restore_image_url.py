"""fix images: restore image_url column, clean bad records, fix links

Revision ID: e1f2a3b4c5d6
Revises: d1e2f3a4b5c6
Create Date: 2026-07-19 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'e1f2a3b4c5d6'
down_revision = 'd1e2f3a4b5c6'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Re-add image_url column to products (for external URLs like Unsplash)
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.Text(), nullable=True))

    # 2. Clean up bad image records created by migration (hash of URL strings, not file content)
    #    Images 1, 2 have hashes computed from URL strings like '/uploads/23d7b17...'
    #    Their original_name contains the URL path, not a real filename
    conn = op.get_bind()
    conn.execute(sa.text("""
        DELETE FROM images
        WHERE original_name LIKE '/uploads/%'
          AND original_name LIKE '%-%-%-%-%'
          AND size < 200
    """))

    # 3. Fix product links: products 85, 86 were linked to bad images above
    #    They should link to the images with correct content-based hashes
    #    Image 5 = Colombian Burger SyS.jpg (hash: 5de7ccc4...)
    #    Image 6 = coquita.webp (hash: 23d7b17d...)
    conn.execute(sa.text("""
        UPDATE products SET image_id = (
            SELECT id FROM images WHERE original_name = 'Colombian Burger SyS.jpg' LIMIT 1
        ) WHERE name = 'Colombian Burger SyS'
    """))
    conn.execute(sa.text("""
        UPDATE products SET image_id = (
            SELECT id FROM images WHERE original_name = 'coquita.webp' LIMIT 1
        ) WHERE name LIKE '%coquita%' OR name LIKE '%Coquita%'
    """))

    # 4. Clean up bad logo image records (hash of base64 data URL strings, not decoded content)
    #    These have original_name = 'logo' and were created from sha256(data_url_string)
    #    Clear logo_id on stores that point to these broken records
    conn.execute(sa.text("""
        UPDATE stores SET logo_id = NULL
        WHERE logo_id IN (
            SELECT id FROM images
            WHERE original_name = 'logo'
              AND size > 100000
        )
    """))
    conn.execute(sa.text("""
        DELETE FROM images WHERE original_name = 'logo' AND size > 100000
    """))


def downgrade():
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_column('image_url')
