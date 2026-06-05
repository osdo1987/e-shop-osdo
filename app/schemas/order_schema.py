from marshmallow import fields, validate
from app.extensions import ma
from app.models.order import Order, OrderItem

class OrderItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = OrderItem
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    product_id = fields.Int(allow_none=True)
    product_name = fields.String(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    price = fields.Float(required=True, validate=validate.Range(min=0))
    selected_size = fields.String(allow_none=True)

class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    store_id = fields.Int(required=True)
    customer_name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    customer_phone = fields.String(allow_none=True)
    total_price = fields.Float(required=True, validate=validate.Range(min=0))
    status = fields.String(validate=validate.OneOf(['PENDIENTE', 'ENTREGADO', 'CANCELADO']))
    items = fields.Nested(OrderItemSchema, many=True, required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
