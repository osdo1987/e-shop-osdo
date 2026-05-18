from flask import Blueprint, request, jsonify
from app.services.category_service import CategoryService
from app.schemas.category_schema import CategorySchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

category_bp = Blueprint('categories', __name__)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

@category_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """
    Get all categories for user's store
    ---
    tags:
      - Categories
    parameters:
      - name: store_id
        in: query
        required: true
        type: integer
    responses:
      200:
        description: List of categories
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Get store_id from query or use user's store
    store_id = request.args.get('store_id', current_user.store_id)
    
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda'}), 404
    
    categories = CategoryService.get_categories_by_store(store_id)
    return jsonify(categories), 200

@category_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """
    Get category by ID
    ---
    tags:
      - Categories
    parameters:
      - name: category_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Category data
      404:
        description: Category not found
    """
    category = CategoryService.get_category_by_id(category_id)
    if not category:
        return jsonify({'error': 'Categoría no encontrada'}), 404
    return jsonify(category), 200

@category_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """
    Create a new category
    ---
    tags:
      - Categories
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            store_id:
              type: integer
    responses:
      201:
        description: Category created
      400:
        description: Validation error
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    data = request.get_json()
    
    # Verify user has access to this store
    if current_user.store_id != data.get('store_id') and current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    if not data.get('name'):
        return jsonify({'error': 'El nombre es obligatorio'}), 400
    
    category = CategoryService.create_category(data['store_id'], data)
    return jsonify(category), 201

@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """
    Update a category
    ---
    tags:
      - Categories
    parameters:
      - name: category_id
        in: path
        required: true
        type: integer
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
    responses:
      200:
        description: Category updated
      404:
        description: Category not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    data = request.get_json()
    category = CategoryService.update_category(category_id, data)
    
    if not category:
        return jsonify({'error': 'Categoría no encontrada'}), 404
    
    return jsonify(category), 200

@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """
    Delete a category
    ---
    tags:
      - Categories
    parameters:
      - name: category_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Category deleted
      404:
        description: Category not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    success = CategoryService.delete_category(category_id)
    if not success:
        return jsonify({'error': 'Categoría no encontrada'}), 404
    
    return jsonify({'message': 'Categoría eliminada'}), 200