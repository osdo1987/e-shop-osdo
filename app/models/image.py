from app.extensions import db
from datetime import datetime


class Image(db.Model):
    __tablename__ = 'images'

    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(64), unique=True, nullable=False, index=True)
    extension = db.Column(db.String(10), nullable=False)
    mime_type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    original_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Image {self.hash}.{self.extension}>'
