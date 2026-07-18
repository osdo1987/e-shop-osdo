from marshmallow import fields, validate
from app.extensions import ma
from app.models.user import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
    
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True, validate=validate.Email())
    role = fields.String(required=True, validate=validate.OneOf(['SUPERADMIN', 'MANAGER', 'STAFF']))
    store_id = fields.Int(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

class ForgotPasswordSchema(ma.Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(ma.Schema):
    token = fields.String(required=True, validate=validate.Length(min=1))
    password = fields.String(required=True, validate=validate.Length(min=6))

class ChangePasswordSchema(ma.Schema):
    currentPassword = fields.String(required=True, validate=validate.Length(min=1))
    newPassword = fields.String(required=True, validate=validate.Length(min=6))