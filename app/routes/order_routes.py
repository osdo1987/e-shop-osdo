from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.order import Order
from app.extensions import socketio

order_bp = Blueprint('orders', __name__)

@order_bp.route('/public', methods=['POST'])
def create_public_order():
    """
    Create a new order from public catalog
    """
    data = request.get_json()
    if not data or not data.get('store_id') or not data.get('customer_name') or not data.get('items'):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
    try:
        order = OrderService.create_order(data['store_id'], data)
        socketio.emit('order_created', order, namespace='/')
        return jsonify(order), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@order_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Get all orders for the user's store
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = request.args.get('store_id', current_user.store_id)
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    # Security: Ensure seller only accesses their own store's orders
    if current_user.role != 'SUPERADMIN' and str(current_user.store_id) != str(store_id):
        return jsonify({'error': 'No autorizado'}), 403
        
    orders = OrderService.get_orders_by_store(store_id)
    return jsonify(orders), 200

@order_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    """
    Update order status
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
        
    # Security: Ensure seller only modifies their own store's orders
    if current_user.role != 'SUPERADMIN' and current_user.store_id != order.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    data = request.get_json()
    new_status = data.get('status')
    if not new_status or new_status not in ['PENDIENTE', 'ENTREGADO', 'CANCELADO']:
        return jsonify({'error': 'Estado no válido'}), 400
        
    try:
        updated_order = OrderService.update_order_status(order_id, new_status)
        socketio.emit('order_updated', updated_order, namespace='/')
        return jsonify(updated_order), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
