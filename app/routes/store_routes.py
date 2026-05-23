from flask import Blueprint, request, jsonify
from app.services.store_service import StoreService
from app.services.category_service import CategoryService
from app.services.product_service import ProductService
from app.schemas.store_schema import StoreSchema
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.user import User

store_bp = Blueprint('stores', __name__)
store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)

@store_bp.route('', methods=['GET'])
@jwt_required()
def get_stores():
    """
    Get all stores (SUPERADMIN only)
    ---
    tags:
      - Stores
    responses:
      200:
        description: List of stores
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    stores = StoreService.get_all_stores()
    return jsonify(stores), 200

@store_bp.route('/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id):
    """
    Get store by ID
    ---
    tags:
      - Stores
    parameters:
      - name: store_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Store data
      404:
        description: Store not found
    """
    store = StoreService.get_store_by_id(store_id)
    if not store:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    return jsonify(store), 200

@store_bp.route('/public/<slug>', methods=['GET'])
def get_store_by_slug(slug):
    """
    Get store by slug (public access for catalog)
    ---
    tags:
      - Stores
    parameters:
      - name: slug
        in: path
        required: true
        type: string
    responses:
      200:
        description: Store data with categories and products
      404:
        description: Store not found
    """
    store = StoreService.get_store_by_slug(slug)
    if not store:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    
    # Get categories and products for this store
    categories = CategoryService.get_categories_by_store(store['id'])
    products = ProductService.get_products_by_store(store['id'])
    
    store['categories'] = categories
    store['products'] = products
    
    return jsonify(store), 200

@store_bp.route('', methods=['POST'])
@jwt_required()
def create_store():
    """
    Create a new store (SUPERADMIN only)
    ---
    tags:
      - Stores
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            slug:
              type: string
            whatsapp:
              type: string
    responses:
      201:
        description: Store created
      400:
        description: Validation error
    """
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
    """
    Update a store (SUPERADMIN only)
    ---
    tags:
      - Stores
    parameters:
      - name: store_id
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
            slug:
              type: string
            whatsapp:
              type: string
    responses:
      200:
        description: Store updated
      404:
        description: Store not found
    """
    claims = get_jwt()
    user_role = claims.get('role', '')
    user_store_id = claims.get('storeId')
    
    # SUPERADMIN can update any store
    # SELLER can only update their own store's WhatsApp
    if user_role != 'SUPERADMIN':
        if user_role != 'SELLER':
            return jsonify({'error': 'No autorizado: rol inválido'}), 403
        if user_store_id is None or user_store_id != store_id:
            return jsonify({'error': 'No autorizado: no tienes permiso para esta tienda'}), 403
        
        # Sellers can only update whatsapp and logo_url fields
        data = request.get_json()
        allowed_data = {
            'whatsapp': data.get('whatsapp'),
            'logo_url': data.get('logo_url')
        }
        store, error = StoreService.update_store(store_id, allowed_data)
    else:
        data = request.get_json()
        store, error = StoreService.update_store(store_id, data)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(store), 200

@store_bp.route('/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    """
    Delete a store (SUPERADMIN only)
    ---
    tags:
      - Stores
    parameters:
      - name: store_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Store deleted
      404:
        description: Store not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    success = StoreService.delete_store(store_id)
    if not success:
        return jsonify({'error': 'Tienda no encontrada'}), 404
    
    return jsonify({'message': 'Tienda eliminada'}), 200