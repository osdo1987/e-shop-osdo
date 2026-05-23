from marshmallow import fields, validate
from app.extensions import ma
from app.models.store import Store

class StoreSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Store
        load_instance = True
    
    id = fields.Int(dump_only=True)
    slug = fields.String(required=True, validate=validate.Length(min=3, max=100))
    name = fields.String(required=True, validate=validate.Length(min=1, max=200))
    whatsapp = fields.String(allow_none=True, validate=validate.Length(max=20))
    logo_url = fields.String(allow_none=True, validate=validate.Length(max=500))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)