from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.cash_register_service import CashRegisterService
from app.schemas.cash_register_schema import CashRegisterSessionSchema

cash_register_bp = Blueprint('cash_register', __name__)
cash_session_schema = CashRegisterSessionSchema()
cash_sessions_schema = CashRegisterSessionSchema(many=True)

@cash_register_bp.route('/session/active', methods=['GET'])
@jwt_required()
def get_active_session():
    """Get current active session for the store"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    session = CashRegisterService.get_active_session(store_id)
    if not session:
        return jsonify({'session': None}), 200
        
    return jsonify({'session': cash_session_schema.dump(session)}), 200

@cash_register_bp.route('/session/open', methods=['POST'])
@jwt_required()
def open_session():
    """Open a new cash register session"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    data = request.get_json() or {}
    opening_balance = data.get('opening_balance')
    notes = data.get('notes')
    
    if opening_balance is None:
        return jsonify({'error': 'El balance de apertura es requerido.'}), 400
        
    try:
        opening_balance = float(opening_balance)
        if opening_balance < 0:
            return jsonify({'error': 'El balance de apertura debe ser mayor o igual a 0.'}), 400
    except ValueError:
        return jsonify({'error': 'El balance de apertura debe ser un número válido.'}), 400
        
    try:
        session = CashRegisterService.open_session(
            store_id=store_id,
            opened_by_id=current_user.id,
            opening_balance=opening_balance,
            notes=notes
        )
        return jsonify(session), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cash_register_bp.route('/session/close', methods=['POST'])
@jwt_required()
def close_session():
    """Close/reconcile the active cash register session"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    active_session = CashRegisterService.get_active_session(store_id)
    if not active_session:
        return jsonify({'error': 'No hay una sesión de caja activa para cerrar.'}), 400
        
    data = request.get_json() or {}
    closing_balance_real = data.get('closing_balance_real')
    notes = data.get('notes')
    
    if closing_balance_real is None:
        return jsonify({'error': 'El balance de cierre real es requerido.'}), 400
        
    try:
        closing_balance_real = float(closing_balance_real)
        if closing_balance_real < 0:
            return jsonify({'error': 'El balance de cierre real debe ser mayor o igual a 0.'}), 400
    except ValueError:
        return jsonify({'error': 'El balance de cierre real debe ser un número válido.'}), 400
        
    try:
        session = CashRegisterService.close_session(
            session_id=active_session.id,
            closing_balance_real=closing_balance_real,
            notes=notes
        )
        return jsonify(session), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cash_register_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions_history():
    """Get cash session history for the store"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    history = CashRegisterService.get_sessions_history(store_id)
    return jsonify(history), 200
