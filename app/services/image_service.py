import os
import hashlib
from flask import current_app
from app.extensions import db
from app.models.image import Image


class ImageService:
    @staticmethod
    def save_image(file, original_name=None):
        if not file or not file.filename:
            raise ValueError('No se proporcionó un archivo')

        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if ext not in current_app.config['ALLOWED_IMAGE_EXTENSIONS']:
            raise ValueError(f'Extensión no permitida: .{ext}')

        file_bytes = file.read()
        file.seek(0)

        if len(file_bytes) > current_app.config['MAX_IMAGE_SIZE']:
            raise ValueError('El archivo excede el tamaño máximo de 5MB')

        file_hash = hashlib.sha256(file_bytes).hexdigest()

        existing = Image.query.filter_by(hash=file_hash).first()
        if existing:
            return existing

        upload_dir = current_app.config['UPLOAD_DIR']
        dir_path = os.path.join(upload_dir, file_hash[:2], file_hash[2:4])
        os.makedirs(dir_path, exist_ok=True)

        filepath = os.path.join(dir_path, f'{file_hash}.{ext}')
        if not os.path.exists(filepath):
            with open(filepath, 'wb') as f:
                f.write(file_bytes)

        image = Image(
            hash=file_hash,
            extension=ext,
            mime_type=file.content_type or f'image/{ext}',
            size=len(file_bytes),
            original_name=original_name or file.filename,
        )
        db.session.add(image)
        db.session.commit()

        return image

    @staticmethod
    def delete_image(image_id):
        image = Image.query.get(image_id)
        if not image:
            return False

        from app.models.product import Product
        from app.models.store import Store
        in_use = Product.query.filter_by(image_id=image_id).first() or Store.query.filter_by(logo_id=image_id).first()
        if in_use:
            return False

        upload_dir = current_app.config['UPLOAD_DIR']
        filepath = os.path.join(upload_dir, image.hash[:2], image.hash[2:4], f'{image.hash}.{image.extension}')
        if os.path.exists(filepath):
            os.remove(filepath)

        db.session.delete(image)
        db.session.commit()
        return True

    @staticmethod
    def get_image_by_hash(file_hash):
        return Image.query.filter_by(hash=file_hash).first()

    @staticmethod
    def get_image_path(file_hash):
        image = Image.query.filter_by(hash=file_hash).first()
        if not image:
            return None
        upload_dir = current_app.config['UPLOAD_DIR']
        return os.path.join(upload_dir, image.hash[:2], image.hash[2:4], f'{image.hash}.{image.extension}')

    @staticmethod
    def image_url(image):
        if not image:
            return None
        return f'/api/images/{image.hash}'
