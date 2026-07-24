from marshmallow import fields, validate
from app.extensions import ma
from app.models.topping_group import ToppingGroup

class ToppingGroupSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ToppingGroup
        load_instance = True

    id = fields.Int(dump_only=True)
    store_id = fields.Int(required=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    config = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
