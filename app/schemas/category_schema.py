from marshmallow import fields, validate
from app.extensions import ma
from app.models.category import Category

class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True
        include_fk = True
    
    id = fields.Int(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    store_id = fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)