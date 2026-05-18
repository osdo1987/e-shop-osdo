from app.extensions import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    store = db.relationship('Store', backref=db.backref('categories', lazy=True, cascade='all, delete-orphan'))
    
    products = db.relationship('Product', backref='category', lazy=True, cascade='all, delete-orphan')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Category {self.name}>'