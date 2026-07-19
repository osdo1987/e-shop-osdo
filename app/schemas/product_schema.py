from marshmallow import fields, validate, post_dump
from app.extensions import ma
from app.models.product import Product


class ProductSchema(ma.SQLAlchemyAutoSchema):
    image_url = fields.Method('get_image_url')

    class Meta:
        model = Product
        load_instance = True
        include_fk = True
        exclude = ()
    
    id = fields.Int(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(allow_none=True)
    price = fields.Float(required=True, validate=validate.Range(min=0))
    promo_price = fields.Float(allow_none=True, validate=validate.Range(min=0))
    purchase_price = fields.Float(allow_none=True, validate=validate.Range(min=0))
    image_id = fields.Int(allow_none=True)
    stock = fields.Int(validate=validate.Range(min=0))
    sizes = fields.String(allow_none=True)
    toppings_config = fields.String(allow_none=True)
    category_id = fields.Int(required=True)
    store_id = fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    def get_image_url(self, obj):
        if hasattr(obj, 'image') and obj.image:
            return f'/api/images/{obj.image.hash}'
        if hasattr(obj, 'image_url') and obj.image_url:
            return obj.image_url
        return None
