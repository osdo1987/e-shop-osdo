from app.extensions import db
from datetime import datetime

class CashRegisterSession(db.Model):
    __tablename__ = 'cash_register_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    opened_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    opened_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    closed_at = db.Column(db.DateTime, nullable=True)
    
    opening_balance = db.Column(db.Float, default=0.0, nullable=False)
    closing_balance_real = db.Column(db.Float, nullable=True)
    closing_balance_expected = db.Column(db.Float, nullable=True)
    
    cash_sales = db.Column(db.Float, default=0.0, nullable=False)
    card_sales = db.Column(db.Float, default=0.0, nullable=False)
    transfer_sales = db.Column(db.Float, default=0.0, nullable=False)
    
    status = db.Column(db.String(20), default='ABIERTA', nullable=False)  # 'ABIERTA', 'CERRADA'
    notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    store = db.relationship('Store', backref=db.backref('cash_sessions', lazy=True, cascade='all, delete-orphan'))
    opened_by = db.relationship('User', backref=db.backref('cash_sessions', lazy=True))
    
    def __repr__(self):
        return f'<CashRegisterSession {self.id} - {self.status}>'
