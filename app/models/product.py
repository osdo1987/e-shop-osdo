from app.extensions import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    promo_price = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    stock = db.Column(db.Integer, default=0)
    sizes = db.Column(db.String(500), nullable=True)
    
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    store = db.relationship('Store', backref=db.backref('products', lazy=True, cascade='all, delete-orphan'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Product {self.name}>'