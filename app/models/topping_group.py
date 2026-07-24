from app.extensions import db
from datetime import datetime

class ToppingGroup(db.Model):
    __tablename__ = 'topping_groups'

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    config = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    store = db.relationship('Store', backref=db.backref('topping_groups', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<ToppingGroup {self.name}>'
