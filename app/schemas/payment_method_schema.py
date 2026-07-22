from marshmallow import fields, validate
from app.extensions import ma
from app.models.payment_method import PaymentMethod

class PaymentMethodSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PaymentMethod
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    store_id = fields.Int(required=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    code = fields.String(required=True, validate=validate.Length(min=1, max=50))
    icon = fields.String(allow_none=True)
    color = fields.String(allow_none=True)
    is_cash = fields.Boolean(missing=False)
    is_active = fields.Boolean(missing=True)
    sort_order = fields.Int(missing=0)
    created_at = fields.DateTime(dump_only=True)
