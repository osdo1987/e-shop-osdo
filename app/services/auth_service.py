from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from datetime import timedelta, datetime
import secrets
import hashlib

class AuthService:
    @staticmethod
    def login(email, password):
        """
        Authenticate user and return JWT token
        """
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return {'error': 'Credenciales inválidas'}, 401
        
        # Create JWT token
        additional_claims = {
            'role': user.role,
            'storeId': user.store_id
        }
        if user.store:
            additional_claims['storeSlug'] = user.store.slug
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims=additional_claims
        )
        
        return {
            'message': 'Login exitoso',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'storeId': user.store_id,
                'storeName': user.store.name if user.store else None
            }
        }, 200
    
    @staticmethod
    def create_seller(store_data, user_data):
        """
        Create a new store and seller (SUPERADMIN only)
        """
        # Check if email already exists
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if existing_user:
            return {'error': 'El correo ya está en uso'}, 400
        
        # Check if slug already exists
        existing_store = Store.query.filter_by(slug=store_data['slug']).first()
        if existing_store:
            return {'error': 'El slug/URL ya está en uso'}, 400
        
        # Create store and user in transaction
        try:
            store = Store(
                name=store_data['name'],
                slug=store_data['slug'],
                whatsapp=store_data.get('whatsapp')
            )
            db.session.add(store)
            db.session.flush()  # Get store.id
            
            user = User(
                email=user_data['email'],
                password_hash='',  # Will be set by set_password
                role='SELLER',
                store_id=store.id
            )
            user.set_password(user_data['password'])
            db.session.add(user)
            db.session.commit()
            
            return {'success': True, 'store': store.id, 'user': user.id}, 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def _generate_reset_token():
        """Generate a cryptographically secure reset token"""
        return secrets.token_urlsafe(48)
    
    @staticmethod
    def _hash_token(token):
        """Hash a token for secure storage (one-way)"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def forgot_password(email):
        """
        Generate a password reset token for the user.
        In production, this would send an email. Here we return it directly 
        since there's no email infrastructure configured.
        """
        user = User.query.filter_by(email=email).first()
        
        # Always return success to prevent email enumeration
        if not user:
            return {
                'message': 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
                'reset_token': None
            }, 200
        
        # Generate and store token (60 minute expiry)
        raw_token = AuthService._generate_reset_token()
        hashed_token = AuthService._hash_token(raw_token)
        user.reset_token = hashed_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=60)
        db.session.commit()
        
        # In production, send email with reset link containing raw_token
        # For this app, we return it in the response since there's no email service
        return {
            'message': 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
            'reset_token': raw_token,  # Only returned because no email service configured
            'email': email
        }, 200
    
    @staticmethod
    def reset_password(token, new_password):
        """
        Reset password using a valid reset token
        """
        if not token or len(token) < 20:
            return {'error': 'Token inválido o expirado'}, 400
        
        hashed_token = AuthService._hash_token(token)
        user = User.query.filter_by(reset_token=hashed_token).first()
        
        if not user:
            return {'error': 'Token inválido o expirado'}, 400
        
        if not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
            return {'error': 'Token expirado. Solicita un nuevo restablecimiento.'}, 400
        
        # Validate password strength
        if len(new_password) < 6:
            return {'error': 'La contraseña debe tener al menos 6 caracteres'}, 400
        
        # Update password and clear token
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()
        
        return {'message': 'Contraseña restablecida exitosamente'}, 200
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """
        Change password for an authenticated user
        """
        user = User.query.get(user_id)
        if not user:
            return {'error': 'Usuario no encontrado'}, 404
        
        # Verify current password
        if not user.check_password(current_password):
            return {'error': 'La contraseña actual es incorrecta'}, 401
        
        # Validate new password
        if len(new_password) < 6:
            return {'error': 'La nueva contraseña debe tener al menos 6 caracteres'}, 400
        
        if current_password == new_password:
            return {'error': 'La nueva contraseña debe ser diferente a la actual'}, 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return {'message': 'Contraseña cambiada exitosamente'}, 200