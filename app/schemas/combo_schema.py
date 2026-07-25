from marshmallow import fields, validate, post_dump
from app.extensions import ma
from app.models.combo import Combo, ComboItem


class ComboItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ComboItem
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    quantity = fields.Int(load_default=1, validate=validate.Range(min=1))
    is_optional = fields.Bool(load_default=False)
    allow_size_variant = fields.Bool(load_default=True)
    product_name = fields.String(dump_only=True)
    product_price = fields.Float(dump_only=True)
    product_image = fields.String(dump_only=True)

    @post_dump
    def add_product_info(self, data, many, **kwargs):
        if 'product_name' not in data or not data.get('product_name'):
            item = ComboItem.query.get(data.get('id'))
            if item and item.product:
                data['product_name'] = item.product.name
                data['product_price'] = item.product.price
                if item.product.image_url:
                    data['product_image'] = item.product.image_url
                elif item.product.image:
                    from app.extensions import db
                    data['product_image'] = f'/api/images/{item.product.image.hash}'
        return data


class ComboSchema(ma.SQLAlchemyAutoSchema):
    image_url = fields.Method('get_image_url')

    class Meta:
        model = Combo
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(allow_none=True)
    price = fields.Float(required=True, validate=validate.Range(min=0))
    promo_price = fields.Float(allow_none=True, validate=validate.Range(min=0))
    image_id = fields.Int(allow_none=True)
    category_id = fields.Int(required=True)
    store_id = fields.Int(required=True)
    is_active = fields.Bool(load_default=True)
    max_per_order = fields.Int(load_default=0)
    items = fields.Nested(ComboItemSchema, many=True, required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Campos calculados
    total_without_discount = fields.Float(dump_only=True)
    savings = fields.Float(dump_only=True)
    savings_percent = fields.Float(dump_only=True)

    def get_image_url(self, obj):
        if hasattr(obj, 'image') and obj.image:
            return f'/api/images/{obj.image.hash}'
        if hasattr(obj, 'image_url') and obj.image_url:
            return obj.image_url
        return None

    @post_dump
    def add_computed_fields(self, data, many, **kwargs):
        combo = Combo.query.get(data.get('id'))
        if combo and combo.items:
            total = 0
            for ci in combo.items:
                if ci.product:
                    item_price = ci.product.promo_price or ci.product.price
                    total += item_price * ci.quantity
            data['total_without_discount'] = total
            price = data.get('promo_price') or data.get('price') or 0
            data['savings'] = total - price
            data['savings_percent'] = round(((total - price) / total * 100), 1) if total > 0 else 0
        return data