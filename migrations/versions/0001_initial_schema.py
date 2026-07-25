"""initial consolidated schema — all tables

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('hash', sa.String(length=64), nullable=False),
        sa.Column('extension', sa.String(length=10), nullable=False),
        sa.Column('mime_type', sa.String(length=50), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('original_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('hash'),
    )
    with op.batch_alter_table('images', schema=None) as batch_op:
        batch_op.create_index('ix_images_hash', ['hash'])

    op.create_table('stores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('whatsapp', sa.String(length=20), nullable=True),
        sa.Column('logo_id', sa.Integer(), nullable=True),
        sa.Column('business_type', sa.String(length=20), nullable=False, server_default='store'),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('schedule', sa.String(length=200), nullable=True),
        sa.Column('delivery_fee', sa.Float(), nullable=True),
        sa.Column('opening_time', sa.String(length=5), nullable=True),
        sa.Column('closing_time', sa.String(length=5), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['logo_id'], ['images.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=128), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='MANAGER'),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('reset_token', sa.String(length=256), nullable=True),
        sa.Column('reset_token_expiry', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index('ix_users_reset_token', ['reset_token'])

    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('payment_methods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True, server_default='#3b82f6'),
        sa.Column('is_cash', sa.Boolean(), nullable=True, server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('sort_order', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('topping_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('config', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('promo_price', sa.Float(), nullable=True),
        sa.Column('purchase_price', sa.Float(), nullable=True),
        sa.Column('image_id', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('manage_stock', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('stock', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('sizes', sa.String(length=500), nullable=True),
        sa.Column('toppings_config', sa.Text(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['image_id'], ['images.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('combos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('promo_price', sa.Float(), nullable=True),
        sa.Column('image_id', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('max_per_order', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['image_id'], ['images.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('combo_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('combo_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('is_optional', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('allow_size_variant', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.ForeignKeyConstraint(['combo_id'], ['combos.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('cash_register_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('opened_by_id', sa.Integer(), nullable=False),
        sa.Column('opened_at', sa.DateTime(), nullable=False),
        sa.Column('closed_at', sa.DateTime(), nullable=True),
        sa.Column('opening_balance', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('closing_balance_real', sa.Float(), nullable=True),
        sa.Column('closing_balance_expected', sa.Float(), nullable=True),
        sa.Column('cash_sales', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('card_sales', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('transfer_sales', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('payment_breakdown', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ABIERTA'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['opened_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('customer_name', sa.String(length=200), nullable=False),
        sa.Column('customer_phone', sa.String(length=20), nullable=True),
        sa.Column('total_price', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='PENDIENTE'),
        sa.Column('delivery_address', sa.Text(), nullable=True),
        sa.Column('customer_notes', sa.Text(), nullable=True),
        sa.Column('seller_notes', sa.Text(), nullable=True),
        sa.Column('estimated_delivery', sa.DateTime(), nullable=True),
        sa.Column('tracking_token', sa.String(length=64), nullable=True),
        sa.Column('origin', sa.String(length=20), nullable=False, server_default='WEB'),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('cash_register_session_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['cash_register_session_id'], ['cash_register_sessions.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_index('ix_orders_tracking_token', ['tracking_token'], unique=True)

    op.create_table('stock_movements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('quantity_change', sa.Integer(), nullable=False),
        sa.Column('previous_stock', sa.Integer(), nullable=False),
        sa.Column('new_stock', sa.Integer(), nullable=False),
        sa.Column('variant_name', sa.String(length=50), nullable=True),
        sa.Column('movement_type', sa.String(length=30), nullable=False, server_default='SALE'),
        sa.Column('reference_type', sa.String(length=30), nullable=True),
        sa.Column('reference_id', sa.Integer(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('cost_at_movement', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('product_name', sa.String(length=200), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('selected_size', sa.String(length=50), nullable=True),
        sa.Column('selected_toppings', sa.Text(), nullable=True),
        sa.Column('extra_price', sa.Float(), nullable=False, server_default=sa.text('0')),
        sa.Column('purchase_price_at_sale', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('order_status_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('old_status', sa.String(length=20), nullable=True),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('changed_by', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('invoice_number', sa.String(length=50), nullable=False),
        sa.Column('customer_name', sa.String(length=200), nullable=False),
        sa.Column('customer_document', sa.String(length=50), nullable=True),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.Column('tax', sa.Float(), nullable=False, server_default=sa.text('0.0')),
        sa.Column('total', sa.Float(), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_number'),
        sa.UniqueConstraint('order_id'),
    )


def downgrade():
    op.drop_table('invoices')
    op.drop_table('order_status_history')
    op.drop_table('order_items')
    op.drop_table('stock_movements')
    op.drop_table('orders')
    op.drop_table('cash_register_sessions')
    op.drop_table('combo_items')
    op.drop_table('combos')
    op.drop_table('products')
    op.drop_table('topping_groups')
    op.drop_table('payment_methods')
    op.drop_table('categories')
    op.drop_table('users')
    op.drop_table('stores')
    with op.batch_alter_table('images', schema=None) as batch_op:
        batch_op.drop_index('ix_images_hash')
    op.drop_table('images')
