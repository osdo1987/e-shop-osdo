from app.extensions import db
from datetime import datetime

class PaymentMethod(db.Model):
    __tablename__ = 'payment_methods'

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(7), default='#3b82f6')
    is_cash = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    store = db.relationship('Store', backref=db.backref('payment_methods', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<PaymentMethod {self.code}>'
