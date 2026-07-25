import json
from flask import Blueprint, request, jsonify
from app.services.combo_service import ComboService
from app.services.image_service import ImageService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.combo import Combo
from app.extensions import db, socketio

combo_bp = Blueprint('combos', __name__)


def _is_blob_url(url):
    return url and isinstance(url, str) and url.startswith('blob:')


@combo_bp.route('', methods=['GET'])
@jwt_required()
def get_combos():
    """Get all combos for user's store"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    store_id = request.args.get('store_id', current_user.store_id)
    category_id = request.args.get('category_id')

    if not store_id:
        return jsonify({'error': 'No se encontró la tienda'}), 404

    combos = ComboService.get_combos_by_store(store_id, category_id, only_active=False)
    return jsonify(combos), 200


@combo_bp.route('/<int:combo_id>', methods=['GET'])
@jwt_required()
def get_combo(combo_id):
    """Get combo by ID"""
    combo = ComboService.get_combo_by_id(combo_id)
    if not combo:
        return jsonify({'error': 'Combo no encontrado'}), 404
    return jsonify(combo), 200


@combo_bp.route('', methods=['POST'])
@jwt_required()
def create_combo():
    """Create a new combo"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden crear combos'}), 403

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
        for field in ['price', 'promo_price', 'category_id']:
            if field in data and data[field]:
                try:
                    data[field] = float(data[field]) if field in ['price', 'promo_price'] else int(data[field])
                except ValueError:
                    pass
        
        if 'items' in data and isinstance(data['items'], str):
            try:
                data['items'] = json.loads(data['items'])
            except (json.JSONDecodeError, TypeError):
                data['items'] = []

    if current_user.store_id != data.get('store_id') and current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403

    if not data.get('name') or not data.get('price') or not data.get('category_id'):
        return jsonify({'error': 'Faltan campos obligatorios (name, price, category_id)'}), 400

    if not data.get('store_id'):
        return jsonify({'error': 'El store_id es requerido'}), 400

    if 'image' in request.files:
        try:
            image = ImageService.save_image(request.files['image'])
            data['image_id'] = image.id
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    if data.get('image_id'):
        data.pop('image_url', None)
    elif _is_blob_url(data.get('image_url')):
        data['image_url'] = None
    elif data.get('image_url') and data['image_url'].startswith('http'):
        pass
    else:
        data.pop('image_url', None)

    try:
        combo = ComboService.create_combo(data['store_id'], data)
        socketio.emit('combo_created', combo, namespace='/')
        return jsonify(combo), 201
    except Exception as e:
        return jsonify({'error': f'Error al crear el combo: {str(e)}'}), 500


@combo_bp.route('/<int:combo_id>', methods=['PUT'])
@jwt_required()
def update_combo(combo_id):
    """Update a combo"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden modificar combos'}), 403

    combo_obj = Combo.query.get(combo_id)
    if not combo_obj:
        return jsonify({'error': 'Combo no encontrado'}), 404

    if current_user.role != 'SUPERADMIN' and current_user.store_id != combo_obj.store_id:
        return jsonify({'error': 'No autorizado'}), 403

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
        for field in ['price', 'promo_price', 'category_id']:
            if field in data and data[field]:
                try:
                    data[field] = float(data[field]) if field in ['price', 'promo_price'] else int(data[field])
                except ValueError:
                    pass
        
        if 'items' in data and isinstance(data['items'], str):
            try:
                data['items'] = json.loads(data['items'])
            except (json.JSONDecodeError, TypeError):
                data['items'] = []

    try:
        if 'image' in request.files:
            try:
                image = ImageService.save_image(request.files['image'])
                data['image_id'] = image.id
            except ValueError as e:
                return jsonify({'error': str(e)}), 400

        if data.get('image_id'):
            data.pop('image_url', None)
        elif _is_blob_url(data.get('image_url')):
            data['image_id'] = combo_obj.image_id
            data.pop('image_url', None)
        elif data.get('image_url') and (data['image_url'].startswith('http') or data['image_url'].startswith('/api/images/')):
            if data['image_url'].startswith('/api/images/'):
                data['image_id'] = combo_obj.image_id
                data.pop('image_url', None)
            else:
                data['image_id'] = None
        else:
            data.pop('image_id', None)
            data.pop('image_url', None)

        combo = ComboService.update_combo(combo_id, data)
        if not combo:
            return jsonify({'error': 'Combo no encontrado'}), 404

        socketio.emit('combo_updated', combo, namespace='/')
        return jsonify(combo), 200
    except Exception as e:
        return jsonify({'error': f'Error al actualizar el combo: {str(e)}'}), 500


@combo_bp.route('/<int:combo_id>', methods=['DELETE'])
@jwt_required()
def delete_combo(combo_id):
    """Delete a combo"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden eliminar combos'}), 403

    combo_obj = Combo.query.get(combo_id)
    if not combo_obj:
        return jsonify({'error': 'Combo no encontrado'}), 404

    if current_user.role != 'SUPERADMIN' and current_user.store_id != combo_obj.store_id:
        return jsonify({'error': 'No autorizado'}), 403

    try:
        success = ComboService.delete_combo(combo_id)
        if not success:
            return jsonify({'error': 'Combo no encontrado'}), 404

        socketio.emit('combo_deleted', {'combo_id': combo_id}, namespace='/')
        return jsonify({'message': 'Combo eliminado'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al eliminar el combo: {str(e)}'}), 500


@combo_bp.route('/public/<slug>', methods=['GET'])
def get_public_combos(slug):
    """Get active combos for public catalog by store slug"""
    from app.models.store import Store
    store = Store.query.filter_by(slug=slug).first()
    if not store:
        return jsonify({'error': 'Tienda no encontrada'}), 404

    combos = ComboService.get_combos_by_store(store.id, only_active=True)
    return jsonify(combos), 200


@combo_bp.route('/profit-analysis/<int:combo_id>', methods=['GET'])
@jwt_required()
def get_combo_profit(combo_id):
    """Get profit analysis for a combo"""
    analysis = ComboService.get_combo_profit_analysis(combo_id)
    if not analysis:
        return jsonify({'error': 'Combo no encontrado'}), 404
    return jsonify(analysis), 200