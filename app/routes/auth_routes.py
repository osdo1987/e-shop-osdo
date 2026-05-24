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
    Register a new seller (SUPERADMIN only)
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
            storeName:
              type: string
              example: "Mi Tienda"
            slug:
              type: string
              example: "mi-tienda"
            whatsapp:
              type: string
              example: "+573001234567"
            email:
              type: string
              example: "vendedor@mitienda.com"
            password:
              type: string
              example: "password123"
    responses:
      201:
        description: Seller and store created successfully
      400:
        description: Validation error
    """
    # Check if current user is SUPERADMIN
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    
    store_data = {
        'name': data.get('storeName'),
        'slug': data.get('slug'),
        'whatsapp': data.get('whatsapp'),
        'logo_url': data.get('logo_url')
    }
    
    user_data = {
        'email': data.get('email'),
        'password': data.get('password')
    }
    
    # Validate required fields
    if not all([store_data['name'], store_data['slug'], user_data['email'], user_data['password']]):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    
    result, status = AuthService.create_seller(store_data, user_data)
    return jsonify(result), status

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