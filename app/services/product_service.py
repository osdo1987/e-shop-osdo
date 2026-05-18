from app.extensions import db
from app.models.product import Product
from app.schemas.product_schema import ProductSchema

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

class ProductService:
    @staticmethod
    def get_products_by_store(store_id, category_id=None):
        """Get all products for a store, optionally filtered by category"""
        if category_id:
            products = Product.query.filter_by(store_id=store_id, category_id=category_id).all()
        else:
            products = Product.query.filter_by(store_id=store_id).all()
        return products_schema.dump(products)
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get product by ID"""
        product = Product.query.get(product_id)
        if product:
            return product_schema.dump(product)
        return None
    
    @staticmethod
    def create_product(store_id, data):
        """Create a new product"""
        product = Product(
            name=data['name'],
            description=data.get('description'),
            price=data['price'],
            promo_price=data.get('promo_price'),
            image_url=data.get('image_url'),
            stock=data.get('stock', 0),
            category_id=data['category_id'],
            store_id=store_id
        )
        db.session.add(product)
        db.session.commit()
        return product_schema.dump(product)
    
    @staticmethod
    def update_product(product_id, data):
        """Update a product"""
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
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'stock' in data:
            product.stock = data['stock']
        if 'category_id' in data:
            product.category_id = data['category_id']
        
        db.session.commit()
        return product_schema.dump(product)
    
    @staticmethod
    def delete_product(product_id):
        """Delete a product"""
        product = Product.query.get(product_id)
        if not product:
            return False
        
        db.session.delete(product)
        db.session.commit()
        return True