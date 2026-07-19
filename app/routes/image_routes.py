import os
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.image_service import ImageService
from app.extensions import db
from app.models.user import User
from app.models.product import Product
from app.models.store import Store

image_bp = Blueprint('images', __name__)


@image_bp.route('', methods=['POST'])
@jwt_required()
def upload_image():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No se proporcionó imagen'}), 400

    file = request.files['image']
    original_name = request.form.get('original_name', file.filename)

    try:
        image = ImageService.save_image(file, original_name)
        return jsonify({
            'id': image.id,
            'hash': image.hash,
            'url': ImageService.image_url(image),
            'extension': image.extension,
            'mime_type': image.mime_type,
            'size': image.size,
            'original_name': image.original_name,
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al guardar la imagen: {str(e)}'}), 500


@image_bp.route('/<file_hash>', methods=['GET'])
def serve_image(file_hash):
    image = ImageService.get_image_by_hash(file_hash)
    if not image:
        return jsonify({'error': 'Imagen no encontrada'}), 404

    upload_dir = current_app.config['UPLOAD_DIR']
    filepath = os.path.join(upload_dir, image.hash[:2], image.hash[2:4], f'{image.hash}.{image.extension}')
    if not os.path.exists(filepath):
        return jsonify({'error': 'Archivo no encontrado en disco'}), 404

    return send_file(filepath, mimetype=image.mime_type)


@image_bp.route('/<int:image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    if current_user.role == 'STAFF':
        return jsonify({'error': 'No autorizado'}), 403

    from app.models.image import Image
    image = Image.query.get(image_id)
    if not image:
        return jsonify({'error': 'Imagen no encontrada'}), 404

    product_using = Product.query.filter_by(image_id=image_id).first()
    store_using = Store.query.filter_by(logo_id=image_id).first()
    if product_using or store_using:
        return jsonify({'error': 'La imagen está en uso y no puede eliminarse'}), 409

    success = ImageService.delete_image(image_id)
    if not success:
        return jsonify({'error': 'Error al eliminar la imagen'}), 500

    return jsonify({'message': 'Imagen eliminada'}), 200
