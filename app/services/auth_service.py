from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from datetime import timedelta

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
                'storeId': user.store_id
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