from flask import Blueprint, request, jsonify
from app.services.store_service import StoreService
from app.services.category_service import CategoryService
from app.services.product_service import ProductService
from app.services.image_service import ImageService
from app.services.order_service import OrderService
from app.schemas.store_schema import StoreSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.order import Order
from app.extensions import db
from datetime import datetime, timedelta, date
from sqlalchemy import func

store_bp = Blueprint('stores', __name__)
store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)

MONTHS_ES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

@store_bp.route('', methods=['GET'])
@jwt_required()
def get_stores():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    stores = StoreService.get_all_stores()
    return jsonify(stores), 200

@store_bp.route('/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id):
    store = StoreService.get_store_by_id(store_id)
    if not store:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    return jsonify(store), 200

@store_bp.route('/public/<slug>', methods=['GET'])
def get_store_by_slug(slug):
    store = StoreService.get_store_by_slug(slug)
    if not store:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    categories = CategoryService.get_categories_by_store(store['id'])
    products = ProductService.get_products_by_store(store['id'])
    store['categories'] = categories
    store['products'] = products
    return jsonify(store), 200

@store_bp.route('', methods=['POST'])
@jwt_required()
def create_store():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    store, error = StoreService.create_store(data)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(store), 201

@store_bp.route('/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        if current_user.store_id is None or current_user.store_id != store_id:
            return jsonify({'error': 'No autorizado: no tienes permiso para esta tienda'}), 403
        data = request.get_json() or {}
        allowed_data = {'whatsapp': data.get('whatsapp')}
        if 'logo' in request.files:
            try:
                image = ImageService.save_image(request.files['logo'])
                allowed_data['logo_id'] = image.id
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
        store, error = StoreService.update_store(store_id, allowed_data)
    elif current_user.role in ('MANAGER',):
        if current_user.store_id is None or current_user.store_id != store_id:
            return jsonify({'error': 'No autorizado: no tienes permiso para esta tienda'}), 403
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        if 'logo' in request.files:
            try:
                image = ImageService.save_image(request.files['logo'])
                data['logo_id'] = image.id
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
        data.pop('logo_url', None)
        store, error = StoreService.update_store(store_id, data)
    elif current_user.role == 'SUPERADMIN':
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        if 'logo' in request.files:
            try:
                image = ImageService.save_image(request.files['logo'])
                data['logo_id'] = image.id
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
        data.pop('logo_url', None)
        store, error = StoreService.update_store(store_id, data)
    else:
        return jsonify({'error': 'No autorizado: rol inválido'}), 403

    if error:
        return jsonify({'error': error}), 400
    return jsonify(store), 200

@store_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_store_metrics():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403

    filter_month = request.args.get('month', type=int)
    filter_year = request.args.get('year', type=int)

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())

    if filter_month and filter_year:
        period_start = datetime(filter_year, filter_month, 1)
        if filter_month == 12:
            period_end = datetime(filter_year + 1, 1, 1)
        else:
            period_end = datetime(filter_year, filter_month + 1, 1)
    else:
        month_start = today_start.replace(day=1)
        period_start = month_start
        period_end = now

    if current_user.role == 'MANAGER':
        from app.models.store import Store as StoreModel
        store_obj = StoreModel.query.get(current_user.store_id)
        stores = [StoreService.get_store_by_id(current_user.store_id)] if store_obj else []
    else:
        stores = StoreService.get_all_stores()
    result = []

    for store_data in stores:
        store_id = store_data['id']

        total_orders = Order.query.filter_by(store_id=store_id).count()
        orders_today = Order.query.filter(
            Order.store_id == store_id, Order.created_at >= today_start
        ).count()
        orders_this_week = Order.query.filter(
            Order.store_id == store_id, Order.created_at >= week_start
        ).count()
        orders_in_period = Order.query.filter(
            Order.store_id == store_id,
            Order.created_at >= period_start,
            Order.created_at < period_end
        ).count()

        status_breakdown = db.session.query(
            Order.status, func.count(Order.id)
        ).filter(Order.store_id == store_id).group_by(Order.status).all()
        status_counts = {status: count for status, count in status_breakdown}

        revenue = db.session.query(func.sum(Order.total_price)).filter(
            Order.store_id == store_id, Order.status != 'CANCELADO'
        ).scalar() or 0

        revenue_today = db.session.query(func.sum(Order.total_price)).filter(
            Order.store_id == store_id, Order.status != 'CANCELADO',
            Order.created_at >= today_start
        ).scalar() or 0

        revenue_this_week = db.session.query(func.sum(Order.total_price)).filter(
            Order.store_id == store_id, Order.status != 'CANCELADO',
            Order.created_at >= week_start
        ).scalar() or 0

        revenue_in_period = db.session.query(func.sum(Order.total_price)).filter(
            Order.store_id == store_id, Order.status != 'CANCELADO',
            Order.created_at >= period_start,
            Order.created_at < period_end
        ).scalar() or 0

        last_order = Order.query.filter_by(store_id=store_id).order_by(Order.created_at.desc()).first()
        seller = User.query.filter_by(store_id=store_id, role='MANAGER').first()

        result.append({
            **store_data,
            'total_orders': total_orders,
            'orders_today': orders_today,
            'orders_this_week': orders_this_week,
            'orders_in_period': orders_in_period,
            'status_counts': {
                'PENDIENTE': status_counts.get('PENDIENTE', 0),
                'CONFIRMADO': status_counts.get('CONFIRMADO', 0),
                'EN_PREPARACION': status_counts.get('EN_PREPARACION', 0),
                'EN_CAMINO': status_counts.get('EN_CAMINO', 0),
                'ENTREGADO': status_counts.get('ENTREGADO', 0),
                'CANCELADO': status_counts.get('CANCELADO', 0),
            },
            'revenue': revenue,
            'revenue_today': revenue_today,
            'revenue_this_week': revenue_this_week,
            'revenue_in_period': revenue_in_period,
            'last_order_date': last_order.created_at.isoformat() if last_order else None,
            'last_login': seller.last_login.isoformat() if seller and seller.last_login else None,
        })

    return jsonify(result), 200

@store_bp.route('/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    success = StoreService.delete_store(store_id)
    if not success:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    return jsonify({'message': 'Tienda eliminada'}), 200
