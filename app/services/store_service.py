from app.extensions import db
from app.models.store import Store
from app.models.user import User
from app.schemas.store_schema import StoreSchema
from app.schemas.user_schema import UserSchema

store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)
user_schema = UserSchema(many=True)

class StoreService:
    @staticmethod
    def get_all_stores():
        """Get all stores with users"""
        stores = Store.query.all()
        result = stores_schema.dump(stores)
        for store_data in result:
            store = Store.query.get(store_data['id'])
            if store:
                store_data['users'] = user_schema.dump(store.users)
        return result
    
    @staticmethod
    def get_store_by_id(store_id):
        """Get store by ID"""
        store = Store.query.get(store_id)
        if store:
            return store_schema.dump(store)
        return None
    
    @staticmethod
    def get_store_by_slug(slug):
        """Get store by slug (for public catalog)"""
        store = Store.query.filter_by(slug=slug).first()
        if store:
            return store_schema.dump(store)
        return None
    
    @staticmethod
    def create_store(data):
        """Create a new store"""
        # Check if slug already exists
        existing = Store.query.filter_by(slug=data['slug']).first()
        if existing:
            return None, 'El slug/URL ya está en uso'
        
        store = Store(
            name=data['name'],
            slug=data['slug'],
            whatsapp=data.get('whatsapp'),
            logo_url=data.get('logo_url'),
            business_type=data.get('business_type', 'store'),
            address=data.get('address'),
            schedule=data.get('schedule')
        )
        db.session.add(store)
        db.session.commit()
        return store_schema.dump(store), None
    
    @staticmethod
    def update_store(store_id, data):
        """Update a store"""
        store = Store.query.get(store_id)
        if not store:
            return None, 'Tienda no encontrada'
        
        if 'name' in data:
            store.name = data['name']
        if 'slug' in data:
            # Check if new slug is taken
            existing = Store.query.filter_by(slug=data['slug']).first()
            if existing and existing.id != store_id:
                return None, 'El slug/URL ya está en uso'
            store.slug = data['slug']
        if 'whatsapp' in data:
            store.whatsapp = data['whatsapp']
        if 'logo_url' in data:
            store.logo_url = data['logo_url']
        if 'business_type' in data:
            store.business_type = data['business_type']
        if 'address' in data:
            store.address = data['address']
        if 'schedule' in data:
            store.schedule = data['schedule']
        
        db.session.commit()
        return store_schema.dump(store), None
    
    @staticmethod
    def delete_store(store_id):
        """Delete a store"""
        store = Store.query.get(store_id)
        if not store:
            return False
        
        db.session.delete(store)
        db.session.commit()
        return True