from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.stock_movement import StockMovement
from app.models.combo import Combo, ComboItem
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, desc

metrics_bp = Blueprint('metrics', __name__)


@metrics_bp.route('/dashboard/<int:store_id>', methods=['GET'])
@jwt_required()
def get_dashboard_metrics(store_id):
    """Dashboard completo con métricas clave de inventario y rentabilidad"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403

    if current_user.role == 'MANAGER' and current_user.store_id != store_id:
        return jsonify({'error': 'No autorizado'}), 403

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_30_days = now - timedelta(days=30)

    # 1. Valor del inventario
    inventory_value = _get_inventory_value(store_id)

    # 2. Productos más vendidos
    top_products = _get_top_products(store_id, last_30_days, limit=10)

    # 3. Alertas de stock bajo
    low_stock_alerts = _get_low_stock_products(store_id, threshold=5)

    # 4. Resumen de rentabilidad del mes
    profit_summary = _get_profit_summary(store_id, month_start, now)

    # 5. Productos sin movimiento
    products_without_movement = _get_products_without_sales(store_id, days=30)

    # 6. Valor del inventario por categoría
    inventory_by_category = _get_inventory_by_category(store_id)

    # 7. Últimos movimientos de stock
    recent_movements = _get_recent_stock_movements(store_id, limit=20)

    # 8. Resumen de combos
    combo_summary = _get_combo_summary(store_id)

    return jsonify({
        'inventory_value': inventory_value,
        'top_products': top_products,
        'low_stock_alerts': low_stock_alerts,
        'profit_summary': profit_summary,
        'products_without_movement': products_without_movement,
        'inventory_by_category': inventory_by_category,
        'recent_movements': recent_movements,
        'combo_summary': combo_summary
    }), 200


@metrics_bp.route('/profit/<int:store_id>', methods=['GET'])
@jwt_required()
def get_profit_metrics(store_id):
    """Métricas detalladas de rentabilidad"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403

    if current_user.role == 'MANAGER' and current_user.store_id != store_id:
        return jsonify({'error': 'No autorizado'}), 403

    # Filtros de fecha
    filter_month = request.args.get('month', type=int)
    filter_year = request.args.get('year', type=int)
    now = datetime.utcnow()

    if filter_month and filter_year:
        period_start = datetime(filter_year, filter_month, 1)
        if filter_month == 12:
            period_end = datetime(filter_year + 1, 1, 1)
        else:
            period_end = datetime(filter_year, filter_month + 1, 1)
    else:
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        period_end = now

    # Rentabilidad general
    general = _get_profit_summary(store_id, period_start, period_end)

    # Rentabilidad por producto
    by_product = _get_profit_by_product(store_id, period_start, period_end)

    # Rentabilidad por categoría
    by_category = _get_profit_by_category(store_id, period_start, period_end)

    # Rentabilidad diaria (últimos 30 días)
    by_day = _get_profit_by_day(store_id, period_start, period_end)

    return jsonify({
        'period': {
            'start': period_start.isoformat(),
            'end': period_end.isoformat()
        },
        'general': general,
        'by_product': by_product,
        'by_category': by_category,
        'by_day': by_day
    }), 200


@metrics_bp.route('/stock-movements/<int:store_id>', methods=['GET'])
@jwt_required()
def get_stock_movements(store_id):
    """Obtener historial de movimientos de stock"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403

    if current_user.role == 'MANAGER' and current_user.store_id != store_id:
        return jsonify({'error': 'No autorizado'}), 403

    product_id = request.args.get('product_id', type=int)
    movement_type = request.args.get('movement_type')
    limit = request.args.get('limit', 50, type=int)

    query = StockMovement.query.filter_by(store_id=store_id)

    if product_id:
        query = query.filter_by(product_id=product_id)
    if movement_type:
        query = query.filter_by(movement_type=movement_type)

    movements = query.order_by(StockMovement.created_at.desc()).limit(limit).all()

    result = []
    for m in movements:
        result.append({
            'id': m.id,
            'product_id': m.product_id,
            'product_name': m.product.name if m.product else 'Producto eliminado',
            'quantity_change': m.quantity_change,
            'previous_stock': m.previous_stock,
            'new_stock': m.new_stock,
            'variant_name': m.variant_name,
            'movement_type': m.movement_type,
            'reference_type': m.reference_type,
            'reference_id': m.reference_id,
            'reason': m.reason,
            'cost_at_movement': m.cost_at_movement,
            'created_by': m.created_by.name if m.created_by else None,
            'created_at': m.created_at.isoformat() if m.created_at else None
        })

    return jsonify(result), 200


# ─── Funciones auxiliares ───────────────────────────────────────────────

def _get_inventory_value(store_id):
    """Calcula el valor total del inventario (stock × purchase_price)"""
    products = Product.query.filter_by(store_id=store_id).all()
    total_value = 0
    total_cost = 0
    product_count = len(products)
    low_stock_count = 0

    for p in products:
        if p.manage_stock:
            cost = (p.purchase_price or 0) * p.stock
            total_cost += cost
            total_value += (p.price or 0) * p.stock
            if p.stock <= 5:
                low_stock_count += 1

    return {
        'total_value': total_value,
        'total_cost': total_cost,
        'potential_profit': total_value - total_cost,
        'product_count': product_count,
        'low_stock_count': low_stock_count
    }


def _get_top_products(store_id, since_date, limit=10):
    """Productos más vendidos por cantidad"""
    result = db.session.query(
        OrderItem.product_id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.price * OrderItem.quantity).label('total_revenue'),
        func.sum(OrderItem.purchase_price_at_sale * OrderItem.quantity).label('total_cost')
    ).join(Order, OrderItem.order_id == Order.id
    ).join(Product, OrderItem.product_id == Product.id
    ).filter(
        Order.store_id == store_id,
        Order.created_at >= since_date,
        Order.status != 'CANCELADO',
        OrderItem.product_id.isnot(None)
    ).group_by(
        OrderItem.product_id, Product.name
    ).order_by(
        desc('total_quantity')
    ).limit(limit).all()

    return [{
        'product_id': r.product_id,
        'name': r.name,
        'units_sold': int(r.total_quantity),
        'revenue': float(r.total_revenue or 0),
        'cost': float(r.total_cost or 0),
        'profit': float((r.total_revenue or 0) - (r.total_cost or 0)),
        'margin': round(((r.total_revenue or 0) - (r.total_cost or 0)) / (r.total_revenue or 1) * 100, 1)
    } for r in result]


def _get_low_stock_products(store_id, threshold=5):
    """Productos con stock por debajo del umbral"""
    products = Product.query.filter(
        Product.store_id == store_id,
        Product.manage_stock == True,
        Product.stock <= threshold
    ).order_by(Product.stock.asc()).all()

    return [{
        'id': p.id,
        'name': p.name,
        'stock': p.stock,
        'price': p.price,
        'purchase_price': p.purchase_price,
        'image_url': p.image_url or (f'/api/images/{p.image.hash}' if p.image else None),
        'category_id': p.category_id
    } for p in products]


def _get_profit_summary(store_id, start_date, end_date):
    """Resumen de rentabilidad en un período"""
    orders = Order.query.filter(
        Order.store_id == store_id,
        Order.created_at >= start_date,
        Order.created_at < end_date,
        Order.status != 'CANCELADO'
    ).all()

    total_revenue = sum(o.total_price for o in orders)
    total_orders = len(orders)

    # Costo de los items vendidos en el período
    items = OrderItem.query.join(Order).filter(
        Order.store_id == store_id,
        Order.created_at >= start_date,
        Order.created_at < end_date,
        Order.status != 'CANCELADO'
    ).all()

    total_cost = sum(
        (item.purchase_price_at_sale or 0) * item.quantity
        for item in items
    )

    gross_profit = total_revenue - total_cost
    margin = round((gross_profit / total_revenue * 100), 1) if total_revenue > 0 else 0

    return {
        'revenue': total_revenue,
        'cost': total_cost,
        'gross_profit': gross_profit,
        'margin': margin,
        'total_orders': total_orders,
        'avg_order_value': round(total_revenue / total_orders, 2) if total_orders > 0 else 0
    }


def _get_profit_by_product(store_id, start_date, end_date):
    """Rentabilidad por producto"""
    result = db.session.query(
        OrderItem.product_id,
        Product.name,
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.price * OrderItem.quantity).label('revenue'),
        func.sum(OrderItem.purchase_price_at_sale * OrderItem.quantity).label('cost')
    ).join(Order, OrderItem.order_id == Order.id
    ).join(Product, OrderItem.product_id == Product.id
    ).filter(
        Order.store_id == store_id,
        Order.created_at >= start_date,
        Order.created_at < end_date,
        Order.status != 'CANCELADO',
        OrderItem.product_id.isnot(None)
    ).group_by(
        OrderItem.product_id, Product.name
    ).order_by(
        desc('revenue')
    ).all()

    return [{
        'product_id': r.product_id,
        'name': r.name,
        'units_sold': int(r.units_sold),
        'revenue': float(r.revenue or 0),
        'cost': float(r.cost or 0),
        'profit': float((r.revenue or 0) - (r.cost or 0)),
        'margin': round(((r.revenue or 0) - (r.cost or 0)) / (r.revenue or 1) * 100, 1)
    } for r in result]


def _get_profit_by_category(store_id, start_date, end_date):
    """Rentabilidad por categoría"""
    from app.models.category import Category

    result = db.session.query(
        Category.id,
        Category.name,
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.price * OrderItem.quantity).label('revenue'),
        func.sum(OrderItem.purchase_price_at_sale * OrderItem.quantity).label('cost')
    ).join(OrderItem, OrderItem.product_id == Product.id
    ).join(Product, Product.category_id == Category.id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(
        Order.store_id == store_id,
        Order.created_at >= start_date,
        Order.created_at < end_date,
        Order.status != 'CANCELADO',
        OrderItem.product_id.isnot(None)
    ).group_by(
        Category.id, Category.name
    ).order_by(
        desc('revenue')
    ).all()

    return [{
        'category_id': r.id,
        'name': r.name,
        'units_sold': int(r.units_sold),
        'revenue': float(r.revenue or 0),
        'cost': float(r.cost or 0),
        'profit': float((r.revenue or 0) - (r.cost or 0)),
        'margin': round(((r.revenue or 0) - (r.cost or 0)) / (r.revenue or 1) * 100, 1)
    } for r in result]


def _get_profit_by_day(store_id, start_date, end_date):
    """Rentabilidad diaria"""
    result = db.session.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_price).label('revenue'),
        func.count(Order.id).label('orders')
    ).filter(
        Order.store_id == store_id,
        Order.created_at >= start_date,
        Order.created_at < end_date,
        Order.status != 'CANCELADO'
    ).group_by(
        func.date(Order.created_at)
    ).order_by(
        func.date(Order.created_at)
    ).all()

    return [{
        'date': str(r.date),
        'revenue': float(r.revenue or 0),
        'orders': int(r.orders)
    } for r in result]


def _get_products_without_sales(store_id, days=30):
    """Productos sin ventas en los últimos N días"""
    since_date = datetime.utcnow() - timedelta(days=days)

    # IDs de productos que sí se vendieron
    sold_ids = db.session.query(OrderItem.product_id).join(Order).filter(
        Order.store_id == store_id,
        Order.created_at >= since_date,
        Order.status != 'CANCELADO',
        OrderItem.product_id.isnot(None)
    ).distinct().subquery()

    products = Product.query.filter(
        Product.store_id == store_id,
        Product.id.notin_(sold_ids),
        Product.manage_stock == True
    ).all()

    return [{
        'id': p.id,
        'name': p.name,
        'stock': p.stock,
        'price': p.price,
        'purchase_price': p.purchase_price,
        'inventory_value': (p.purchase_price or 0) * p.stock
    } for p in products]


def _get_inventory_by_category(store_id):
    """Valor del inventario agrupado por categoría"""
    from app.models.category import Category

    result = db.session.query(
        Category.id,
        Category.name,
        func.count(Product.id).label('product_count'),
        func.sum(Product.stock).label('total_stock'),
        func.sum((Product.purchase_price or 0) * Product.stock).label('total_cost'),
        func.sum(Product.price * Product.stock).label('total_value')
    ).join(Product, Product.category_id == Category.id
    ).filter(
        Product.store_id == store_id,
        Product.manage_stock == True
    ).group_by(
        Category.id, Category.name
    ).all()

    return [{
        'category_id': r.id,
        'name': r.name,
        'product_count': int(r.product_count),
        'total_stock': int(r.total_stock or 0),
        'total_cost': float(r.total_cost or 0),
        'total_value': float(r.total_value or 0),
        'potential_profit': float((r.total_value or 0) - (r.total_cost or 0))
    } for r in result]


def _get_recent_stock_movements(store_id, limit=20):
    """Últimos movimientos de stock"""
    movements = StockMovement.query.filter_by(store_id=store_id).order_by(
        StockMovement.created_at.desc()
    ).limit(limit).all()

    return [{
        'id': m.id,
        'product_id': m.product_id,
        'product_name': m.product.name if m.product else 'N/A',
        'quantity_change': m.quantity_change,
        'previous_stock': m.previous_stock,
        'new_stock': m.new_stock,
        'movement_type': m.movement_type,
        'reason': m.reason,
        'created_at': m.created_at.isoformat() if m.created_at else None
    } for m in movements]


def _get_combo_summary(store_id):
    """Resumen de combos de la tienda"""
    combos = Combo.query.filter_by(store_id=store_id).all()
    active_combos = [c for c in combos if c.is_active]

    return {
        'total_combos': len(combos),
        'active_combos': len(active_combos),
        'combos': [{
            'id': c.id,
            'name': c.name,
            'price': c.price,
            'promo_price': c.promo_price,
            'is_active': c.is_active,
            'items_count': len(c.items)
        } for c in combos]
    }