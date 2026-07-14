from app.extensions import db
from datetime import datetime

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_document = db.Column(db.String(50), nullable=True)  # DNI/NIT/RUT/etc.
    
    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, default=0.0, nullable=False)
    total = db.Column(db.Float, nullable=False)
    
    payment_method = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    store = db.relationship('Store', backref=db.backref('invoices', lazy=True, cascade='all, delete-orphan'))
    order = db.relationship('Order', backref=db.backref('invoice', uselist=False))
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number} - Total {self.total}>'
