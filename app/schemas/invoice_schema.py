from marshmallow import fields, validate
from app.extensions import ma
from app.models.invoice import Invoice

class InvoiceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    store_id = fields.Int(required=True)
    order_id = fields.Int(required=True)
    invoice_number = fields.String(dump_only=True)
    customer_name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    customer_document = fields.String(allow_none=True)
    subtotal = fields.Float(required=True, validate=validate.Range(min=0))
    tax = fields.Float(validate=validate.Range(min=0), default=0.0)
    total = fields.Float(required=True, validate=validate.Range(min=0))
    payment_method = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
