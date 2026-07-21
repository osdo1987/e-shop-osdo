import json
from app.extensions import db
from app.models.product import Product
from app.schemas.product_schema import ProductSchema

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

class ProductService:
    @staticmethod
    def get_products_by_store(store_id, category_id=None):
        if category_id:
            products = Product.query.filter_by(store_id=store_id, category_id=category_id).all()
        else:
            products = Product.query.filter_by(store_id=store_id).all()
        return products_schema.dump(products)
    
    @staticmethod
    def get_product_by_id(product_id):
        product = Product.query.get(product_id)
        if product:
            return product_schema.dump(product)
        return None
    
    @staticmethod
    def create_product(store_id, data):
        try:
            sizes = data.get('sizes')
            if sizes is not None and not isinstance(sizes, str):
                sizes = json.dumps(sizes)
            toppings = data.get('toppings_config')
            if toppings is not None and not isinstance(toppings, str):
                toppings = json.dumps(toppings)
            product = Product(
                name=data['name'],
                description=data.get('description'),
                price=data['price'],
                promo_price=data.get('promo_price'),
                purchase_price=data.get('purchase_price'),
                image_id=data.get('image_id'),
                image_url=data.get('image_url'),
                manage_stock=data.get('manage_stock', True),
                stock=data.get('stock', 0),
                sizes=sizes,
                toppings_config=toppings,
                category_id=data['category_id'],
                store_id=store_id
            )
            db.session.add(product)
            db.session.commit()
            return product_schema.dump(product)
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def update_product(product_id, data):
        try:
            product = Product.query.get(product_id)
            if not product:
                return None
            
            if 'name' in data:
                product.name = data['name']
            if 'description' in data:
                product.description = data['description']
            if 'price' in data:
                product.price = data['price']
            if 'promo_price' in data:
                product.promo_price = data['promo_price']
            if 'purchase_price' in data:
                product.purchase_price = data['purchase_price']
            if 'image_id' in data:
                product.image_id = data['image_id']
            if 'image_url' in data:
                product.image_url = data['image_url']
            if 'manage_stock' in data:
                product.manage_stock = data['manage_stock']
            if 'stock' in data:
                product.stock = data['stock']
            if 'sizes' in data:
                sizes = data['sizes']
                if sizes is not None and not isinstance(sizes, str):
                    sizes = json.dumps(sizes)
                product.sizes = sizes
            if 'toppings_config' in data:
                toppings = data['toppings_config']
                if toppings is not None and not isinstance(toppings, str):
                    toppings = json.dumps(toppings)
                product.toppings_config = toppings
            if 'category_id' in data:
                product.category_id = data['category_id']
            
            db.session.commit()
            return product_schema.dump(product)
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def delete_product(product_id):
        try:
            product = Product.query.get(product_id)
            if not product:
                return False
            
            image_id = product.image_id
            db.session.delete(product)
            db.session.commit()

            if image_id:
                from app.services.image_service import ImageService
                ImageService.delete_image(image_id)

            return True
        except Exception as e:
            db.session.rollback()
            raise e
