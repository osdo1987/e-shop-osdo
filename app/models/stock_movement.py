from app.extensions import db
from datetime import datetime

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    quantity_change = db.Column(db.Integer, nullable=False)  # negativo=salida, positivo=entrada
    previous_stock = db.Column(db.Integer, nullable=False)
    new_stock = db.Column(db.Integer, nullable=False)
    variant_name = db.Column(db.String(50), nullable=True)
    movement_type = db.Column(db.String(30), nullable=False, default='SALE')
    # 'SALE', 'CANCELLATION', 'MANUAL_ADJUSTMENT', 'PURCHASE', 'INITIAL', 'COMBO_SALE'
    reference_type = db.Column(db.String(30), nullable=True)  # 'order', 'manual', 'combo'
    reference_id = db.Column(db.Integer, nullable=True)
    reason = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    cost_at_movement = db.Column(db.Float, nullable=True)  # purchase_price al momento del movimiento
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('stock_movements', lazy=True, cascade='all, delete-orphan'))
    store = db.relationship('Store')
    created_by = db.relationship('User')

    def __repr__(self):
        return f'<StockMovement {self.movement_type} ({self.quantity_change})>'