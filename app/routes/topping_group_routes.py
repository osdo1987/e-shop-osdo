from flask import Blueprint, request, jsonify
from app.services.topping_group_service import ToppingGroupService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

topping_group_bp = Blueprint('topping_groups', __name__)

@topping_group_bp.route('', methods=['GET'])
@jwt_required()
def get_topping_groups():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    groups = ToppingGroupService.get_topping_groups(user.store_id)
    return jsonify(groups), 200

@topping_group_bp.route('', methods=['POST'])
@jwt_required()
def create_topping_group():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    if not data or not data.get('name') or not data.get('config'):
        return jsonify({'error': 'Nombre y config son requeridos'}), 400
    try:
        group = ToppingGroupService.create_topping_group(user.store_id, data)
        return jsonify(group), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@topping_group_bp.route('/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_topping_group(group_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    try:
        group = ToppingGroupService.update_topping_group(user.store_id, group_id, data)
        return jsonify(group), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404

@topping_group_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_topping_group(group_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    try:
        ToppingGroupService.delete_topping_group(user.store_id, group_id)
        return jsonify({'message': 'Grupo de toppings eliminado'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
