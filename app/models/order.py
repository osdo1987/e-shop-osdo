import secrets
from app.extensions import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=True)
    total_price = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(20), nullable=False, default='PENDIENTE')
    # PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO
    
    delivery_address = db.Column(db.Text, nullable=True)
    customer_notes = db.Column(db.Text, nullable=True)
    seller_notes = db.Column(db.Text, nullable=True)
    estimated_delivery = db.Column(db.DateTime, nullable=True)
    tracking_token = db.Column(db.String(64), unique=True, nullable=True, index=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    store = db.relationship('Store', backref=db.backref('orders', lazy=True, cascade='all, delete-orphan'))
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    status_history = db.relationship('OrderStatusHistory', backref='order', lazy=True, 
                                      cascade='all, delete-orphan', order_by='OrderStatusHistory.created_at.desc()')

    def __repr__(self):
        return f'<Order {self.id} - {self.status}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    product_name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)
    selected_size = db.Column(db.String(50), nullable=True)
    selected_toppings = db.Column(db.Text, nullable=True)
    extra_price = db.Column(db.Float, nullable=False, default=0)
    
    product = db.relationship('Product')

    def __repr__(self):
        return f'<OrderItem {self.product_name} x {self.quantity}>'


VALID_STATUSES = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']

STATUS_TRANSITIONS = {
    'PENDIENTE': ['CONFIRMADO', 'CANCELADO'],
    'CONFIRMADO': ['EN_PREPARACION', 'CANCELADO'],
    'EN_PREPARACION': ['EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
    'EN_CAMINO': ['ENTREGADO', 'CANCELADO'],
    'ENTREGADO': [],
    'CANCELADO': [],
}

STATUS_LABELS = {
    'PENDIENTE': 'Pendiente',
    'CONFIRMADO': 'Confirmado',
    'EN_PREPARACION': 'En Preparación',
    'EN_CAMINO': 'En Camino',
    'ENTREGADO': 'Entregado',
    'CANCELADO': 'Cancelado',
}


class OrderStatusHistory(db.Model):
    __tablename__ = 'order_status_history'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=False)
    changed_by = db.Column(db.String(100), nullable=True)  # "Vendedor", "Sistema", etc.
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<OrderStatusHistory Order#{self.order_id} {self.old_status} -> {self.new_status}>'
