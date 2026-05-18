from marshmallow import fields, validate
from app.extensions import ma
from app.models.product import Product

class ProductSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        load_instance = True
        include_fk = True
    
    id = fields.Int(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(allow_none=True)
    price = fields.Float(required=True, validate=validate.Range(min=0))
    promo_price = fields.Float(allow_none=True, validate=validate.Range(min=0))
    image_url = fields.URL(allow_none=True)
    stock = fields.Int(validate=validate.Range(min=0))
    category_id = fields.Int(required=True)
    store_id = fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)