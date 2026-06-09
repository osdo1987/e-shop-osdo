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

@order_bp.route('/public/track/<token>', methods=['GET'])
def track_order(token):
    """
    Public endpoint to track order by token (no auth required)
    """
    order = OrderService.get_order_by_token(token)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(order), 200

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
        
    if current_user.role != 'SUPERADMIN' and str(current_user.store_id) != str(store_id):
        return jsonify({'error': 'No autorizado'}), 403
        
    orders = OrderService.get_orders_by_store(store_id)
    return jsonify(orders), 200

@order_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    """
    Update order status with transition validation
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
        
    if current_user.role != 'SUPERADMIN' and current_user.store_id != order.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    data = request.get_json()
    new_status = data.get('status')
    notes = data.get('notes')
    
    if not new_status:
        return jsonify({'error': 'El estado es requerido'}), 400
        
    updated_order, error = OrderService.update_order_status(
        order_id, new_status, 
        changed_by=current_user.email,
        notes=notes
    )
    
    if error:
        return jsonify({'error': error}), 400
    
    socketio.emit('order_updated', updated_order, namespace='/')
    return jsonify(updated_order), 200

@order_bp.route('/<int:order_id>/notes', methods=['PUT'])
@jwt_required()
def update_notes(order_id):
    """
    Update seller notes for an order
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
        
    if current_user.role != 'SUPERADMIN' and current_user.store_id != order.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    data = request.get_json()
    notes = data.get('seller_notes', '')
    
    updated_order, error = OrderService.update_seller_notes(order_id, notes)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(updated_order), 200

@order_bp.route('/<int:order_id>/estimated-delivery', methods=['PUT'])
@jwt_required()
def update_estimated_delivery(order_id):
    """
    Update estimated delivery time
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
        
    if current_user.role != 'SUPERADMIN' and current_user.store_id != order.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    data = request.get_json()
    estimated_delivery = data.get('estimated_delivery')
    
    updated_order, error = OrderService.update_estimated_delivery(order_id, estimated_delivery)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(updated_order), 200

@order_bp.route('/<int:order_id>/history', methods=['GET'])
@jwt_required()
def get_order_history(order_id):
    """
    Get status history for an order
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
        
    if current_user.role != 'SUPERADMIN' and current_user.store_id != order.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    history = OrderService.get_order_history(order_id)
    return jsonify(history), 200