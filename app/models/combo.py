from app.extensions import db
from datetime import datetime

class Combo(db.Model):
    __tablename__ = 'combos'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    promo_price = db.Column(db.Float, nullable=True)
    image_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    max_per_order = db.Column(db.Integer, default=0)  # 0 = sin límite
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    image = db.relationship('Image', lazy='joined')
    category = db.relationship('Category')
    store = db.relationship('Store', backref=db.backref('combos', lazy=True, cascade='all, delete-orphan'))
    items = db.relationship('ComboItem', backref='combo', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Combo {self.name}>'


class ComboItem(db.Model):
    __tablename__ = 'combo_items'

    id = db.Column(db.Integer, primary_key=True)
    combo_id = db.Column(db.Integer, db.ForeignKey('combos.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    is_optional = db.Column(db.Boolean, default=False, nullable=False)
    allow_size_variant = db.Column(db.Boolean, default=True, nullable=False)

    product = db.relationship('Product')

    def __repr__(self):
        return f'<ComboItem {self.product_id} x{self.quantity}>'