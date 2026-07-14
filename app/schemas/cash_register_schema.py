from marshmallow import fields, validate
from app.extensions import ma
from app.models.cash_register import CashRegisterSession

class CashRegisterSessionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CashRegisterSession
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    store_id = fields.Int(required=True)
    opened_by_id = fields.Int(required=True)
    opened_at = fields.DateTime(dump_only=True)
    closed_at = fields.DateTime(allow_none=True)
    opening_balance = fields.Float(required=True, validate=validate.Range(min=0))
    closing_balance_real = fields.Float(allow_none=True, validate=validate.Range(min=0))
    closing_balance_expected = fields.Float(allow_none=True)
    cash_sales = fields.Float(dump_only=True)
    card_sales = fields.Float(dump_only=True)
    transfer_sales = fields.Float(dump_only=True)
    status = fields.String(validate=validate.OneOf(['ABIERTA', 'CERRADA']))
    notes = fields.String(allow_none=True)
