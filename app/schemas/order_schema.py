from marshmallow import fields, validate
from app.extensions import ma
from app.models.order import Order, OrderItem, OrderStatusHistory, VALID_STATUSES
from app.models.store import Store

class OrderStatusHistorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = OrderStatusHistory
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    order_id = fields.Int(dump_only=True)
    old_status = fields.String(allow_none=True)
    new_status = fields.String(required=True)
    changed_by = fields.String(allow_none=True)
    notes = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

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
    selected_toppings = fields.String(allow_none=True)
    extra_price = fields.Float(allow_none=True, default=0)
    purchase_price_at_sale = fields.Float(allow_none=True)

class StoreBriefSchema(ma.SQLAlchemyAutoSchema):
    logo_url = fields.Method('get_logo_url')

    class Meta:
        model = Store
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    name = fields.String(dump_only=True)
    slug = fields.String(dump_only=True)
    whatsapp = fields.String(dump_only=True)
    address = fields.String(dump_only=True)
    schedule = fields.String(dump_only=True)

    def get_logo_url(self, obj):
        if hasattr(obj, 'logo') and obj.logo:
            return f'/api/images/{obj.logo.hash}'
        return None

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
    status = fields.String(validate=validate.OneOf(VALID_STATUSES))
    items = fields.Nested(OrderItemSchema, many=True, required=True)
    status_history = fields.Nested(OrderStatusHistorySchema, many=True, dump_only=True)
    delivery_address = fields.String(allow_none=True)
    customer_notes = fields.String(allow_none=True)
    seller_notes = fields.String(allow_none=True)
    estimated_delivery = fields.DateTime(allow_none=True)
    tracking_token = fields.String(dump_only=True)
    origin = fields.String(validate=validate.OneOf(['WEB', 'LOCAL']), missing='WEB')
    payment_method = fields.String(allow_none=True)
    cash_register_session_id = fields.Int(allow_none=True)
    store = fields.Nested(StoreBriefSchema, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
