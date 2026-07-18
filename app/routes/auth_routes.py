from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.schemas.user_schema import LoginSchema, UserSchema, ForgotPasswordSchema, ResetPasswordSchema, ChangePasswordSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)
login_schema = LoginSchema()
user_schema = UserSchema()
users_schema = UserSchema(many=True)
forgot_password_schema = ForgotPasswordSchema()
reset_password_schema = ResetPasswordSchema()
change_password_schema = ChangePasswordSchema()

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User Login Endpoint
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: "vendedor@tienda.com"
            password:
              type: string
              example: "password123"
    responses:
      200:
        description: Successful login
      400:
        description: Validation error
      401:
        description: Invalid credentials
    """
    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    result, status = AuthService.login(data['email'], data['password'])
    return jsonify(result), status

@auth_bp.route('/register-seller', methods=['POST'])
@jwt_required()
def register_seller():
    """
    Register a new manager with store (SUPERADMIN only)
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    
    store_data = {
        'name': data.get('storeName'),
        'slug': data.get('slug'),
        'whatsapp': data.get('whatsapp'),
        'logo_url': data.get('logo_url'),
        'business_type': data.get('business_type', 'store'),
        'address': data.get('address'),
        'schedule': data.get('schedule')
    }
    
    user_data = {
        'email': data.get('email'),
        'password': data.get('password')
    }
    
    if not all([store_data['name'], store_data['slug'], user_data['email'], user_data['password']]):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    
    result, status = AuthService.create_seller(store_data, user_data)
    return jsonify(result), status

@auth_bp.route('/register-staff', methods=['POST'])
@jwt_required()
def register_staff():
    """
    Register a new staff user (MANAGER only)
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Faltan campos obligatorios (email, password)'}), 400
    
    if current_user.role == 'SUPERADMIN':
        store_id = data.get('store_id')
        if not store_id:
            return jsonify({'error': 'El store_id es requerido para SUPERADMIN'}), 400
        from app.models.store import Store
        store = Store.query.get(store_id)
        if not store:
            return jsonify({'error': 'Tienda no encontrada'}), 404
        try:
            user = User(email=email, role='STAFF', store_id=store_id)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            return jsonify({'success': True, 'user': user.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        result, status = AuthService.create_staff(current_user, {'email': email, 'password': password})
        return jsonify(result), status

@auth_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """Get all STAFF users for the manager's store"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403
    
    if current_user.role == 'SUPERADMIN':
        store_id = request.args.get('store_id')
        if not store_id:
            users = User.query.filter_by(role='STAFF').all()
        else:
            users = User.query.filter_by(role='STAFF', store_id=store_id).all()
    else:
        users = User.query.filter_by(role='STAFF', store_id=current_user.store_id).all()
    
    return jsonify(users_schema.dump(users)), 200

@auth_bp.route('/staff/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_staff(user_id):
    """Delete a STAFF user (MANAGER or SUPERADMIN only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role not in ('SUPERADMIN', 'MANAGER'):
        return jsonify({'error': 'No autorizado'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    if user.role != 'STAFF':
        return jsonify({'error': 'Solo se pueden eliminar usuarios STAFF'}), 400
    
    if current_user.role == 'MANAGER' and user.store_id != current_user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Empleado eliminado'}), 200

@auth_bp.route('/users/<int:user_id>/email', methods=['PUT'])
@jwt_required()
def update_seller_email(user_id):
    """
    Update a seller's email (SUPERADMIN only)
    ---
    tags:
      - Auth
    parameters:
      - name: user_id
        in: path
        required: true
        type: integer
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: "nuevo@correo.com"
    responses:
      200:
        description: Email updated successfully
      400:
        description: Validation error
      403:
        description: Not authorized
      404:
        description: User not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    new_email = data.get('email')
    
    if not new_email:
        return jsonify({'error': 'El correo electrónico es requerido'}), 400
    
    # Check if email already exists (exclude current user)
    existing_user = User.query.filter(User.email == new_email, User.id != user_id).first()
    if existing_user:
        return jsonify({'error': 'El correo electrónico ya está en uso'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    if user.role not in ('MANAGER', 'STAFF'):
        return jsonify({'error': 'Solo se pueden modificar correos de vendedores'}), 400
    
    user.email = new_email
    db.session.commit()
    
    return jsonify({'message': 'Correo electrónico actualizado exitosamente', 'user': user_schema.dump(user)}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user
    ---
    tags:
      - Auth
    responses:
      200:
        description: User data
      401:
        description: Not authenticated
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify(user_schema.dump(user)), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Request password reset
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: "vendedor@tienda.com"
    responses:
      200:
        description: Reset instructions sent (or would be sent)
      400:
        description: Validation error
    """
    data = request.get_json()
    errors = forgot_password_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    result, status = AuthService.forgot_password(data['email'])
    return jsonify(result), status

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset password using token
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            token:
              type: string
              example: "abc123..."
            password:
              type: string
              example: "newPassword456"
    responses:
      200:
        description: Password reset successfully
      400:
        description: Invalid or expired token
    """
    data = request.get_json()
    errors = reset_password_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    result, status = AuthService.reset_password(data['token'], data['password'])
    return jsonify(result), status

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change password for authenticated user
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            currentPassword:
              type: string
              example: "oldPassword123"
            newPassword:
              type: string
              example: "newPassword456"
    responses:
      200:
        description: Password changed successfully
      400:
        description: Validation error
      401:
        description: Current password is incorrect
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    errors = change_password_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    result, status = AuthService.change_password(
        current_user_id,
        data['currentPassword'],
        data['newPassword']
    )
    return jsonify(result), status