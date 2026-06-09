from app.extensions import db
from datetime import datetime

class Store(db.Model):
    __tablename__ = 'stores'
    
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    whatsapp = db.Column(db.String(20), nullable=True)
    logo_url = db.Column(db.Text, nullable=True)
    business_type = db.Column(db.String(20), nullable=False, default='store')  # 'store' o 'restaurant'
    address = db.Column(db.Text, nullable=True)
    schedule = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Store {self.name}>'