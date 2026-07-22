from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.payment_method_service import PaymentMethodService

payment_method_bp = Blueprint('payment_methods', __name__)

@payment_method_bp.route('', methods=['GET'])
@jwt_required()
def get_payment_methods():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400

    only_active = request.args.get('active', 'true').lower() == 'true'
    methods = PaymentMethodService.get_payment_methods(store_id, only_active=only_active)
    return jsonify(methods), 200

@payment_method_bp.route('', methods=['POST'])
@jwt_required()
def create_payment_method():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400

    data = request.get_json()
    if not data or not data.get('name') or not data.get('code'):
        return jsonify({'error': 'Nombre y código son requeridos'}), 400

    try:
        pm = PaymentMethodService.create_payment_method(store_id, data)
        return jsonify(pm), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_method_bp.route('/<int:method_id>', methods=['PUT'])
@jwt_required()
def update_payment_method(method_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Datos requeridos'}), 400

    try:
        pm = PaymentMethodService.update_payment_method(store_id, method_id, data)
        return jsonify(pm), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_method_bp.route('/<int:method_id>', methods=['DELETE'])
@jwt_required()
def delete_payment_method(method_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400

    try:
        PaymentMethodService.delete_payment_method(store_id, method_id)
        return jsonify({'message': 'Método de pago eliminado'}), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_method_bp.route('/public/<int:store_id>', methods=['GET'])
def get_public_payment_methods(store_id):
    methods = PaymentMethodService.get_payment_methods(store_id, only_active=True)
    return jsonify(methods), 200

@payment_method_bp.route('/seed', methods=['POST'])
@jwt_required()
def seed_payment_methods():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400

    try:
        PaymentMethodService.seed_defaults(store_id)
        return jsonify({'message': 'Métodos de pago por defecto creados'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
