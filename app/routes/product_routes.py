from flask import Blueprint, request, jsonify
from app.services.product_service import ProductService
from app.schemas.product_schema import ProductSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.product import Product
from app.extensions import socketio

product_bp = Blueprint('products', __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

@product_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """
    Get all products for user's store
    ---
    tags:
      - Products
    parameters:
      - name: store_id
        in: query
        required: true
        type: integer
      - name: category_id
        in: query
        required: false
        type: integer
    responses:
      200:
        description: List of products
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Get store_id from query or use user's store
    store_id = request.args.get('store_id', current_user.store_id)
    category_id = request.args.get('category_id')
    
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda'}), 404
    
    products = ProductService.get_products_by_store(store_id, category_id)
    return jsonify(products), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """
    Get product by ID
    ---
    tags:
      - Products
    parameters:
      - name: product_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Product data
      404:
        description: Product not found
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
    return jsonify(product), 200

@product_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """
    Create a new product
    ---
    tags:
      - Products
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            description:
              type: string
            price:
              type: number
            promo_price:
              type: number
            image_url:
              type: string
            stock:
              type: integer
            category_id:
              type: integer
            store_id:
              type: integer
    responses:
      201:
        description: Product created
      400:
        description: Validation error
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden crear productos'}), 403
    
    # Handle both JSON and multipart/form-data requests
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
        # Parse numeric fields from form data
        for field in ['price', 'promo_price', 'purchase_price', 'stock', 'category_id', 'store_id']:
            if field in data and data[field]:
                try:
                    data[field] = float(data[field]) if field in ['price', 'promo_price', 'purchase_price'] else int(data[field])
                except ValueError:
                    pass
    
    if current_user.store_id != data.get('store_id') and current_user.role != 'SUPERADMIN':
        return jsonify({'error': 'No autorizado'}), 403
    
    if not data.get('name') or not data.get('price') or not data.get('category_id'):
        return jsonify({'error': 'Faltan campos obligatorios (name, price, category_id)'}), 400
    
    if not data.get('store_id'):
        return jsonify({'error': 'El store_id es requerido'}), 400
    
    try:
        product = ProductService.create_product(data['store_id'], data)
        socketio.emit('product_created', product, namespace='/')
        return jsonify(product), 201
    except Exception as e:
        return jsonify({'error': f'Error al crear el producto: {str(e)}'}), 500

@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """
    Update a product
    ---
    tags:
      - Products
    parameters:
      - name: product_id
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
            description:
              type: string
            price:
              type: number
            promo_price:
              type: number
            image_url:
              type: string
            stock:
              type: integer
            category_id:
              type: integer
    responses:
      200:
        description: Product updated
      404:
        description: Product not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden modificar productos'}), 403
    
    product_obj = Product.query.get(product_id)
    if not product_obj:
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    if current_user.role != 'SUPERADMIN' and current_user.store_id != product_obj.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    # Handle both JSON and multipart/form-data requests
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
        # Parse numeric fields from form data
        for field in ['price', 'promo_price', 'purchase_price', 'stock', 'category_id']:
            if field in data and data[field]:
                try:
                    data[field] = float(data[field]) if field in ['price', 'promo_price', 'purchase_price'] else int(data[field])
                except ValueError:
                    pass
    
    try:
        product = ProductService.update_product(product_id, data)
        if not product:
            return jsonify({'error': 'Producto no encontrado'}), 404
        socketio.emit('product_updated', product, namespace='/')
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': f'Error al actualizar el producto: {str(e)}'}), 500

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """
    Delete a product
    ---
    tags:
      - Products
    parameters:
      - name: product_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Product deleted
      404:
        description: Product not found
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado: los empleados no pueden eliminar productos'}), 403
    
    product_obj = Product.query.get(product_id)
    if not product_obj:
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    if current_user.role != 'SUPERADMIN' and current_user.store_id != product_obj.store_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    try:
        success = ProductService.delete_product(product_id)
        if not success:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        socketio.emit('product_deleted', {'product_id': product_id}, namespace='/')
        return jsonify({'message': 'Producto eliminado'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al eliminar el producto: {str(e)}'}), 500
