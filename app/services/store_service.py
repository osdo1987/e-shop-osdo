from app.extensions import db
from app.models.store import Store
from app.models.user import User
from app.schemas.store_schema import StoreSchema

store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)

class StoreService:
    @staticmethod
    def get_all_stores():
        """Get all stores"""
        stores = Store.query.all()
        return stores_schema.dump(stores)
    
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
            whatsapp=data.get('whatsapp')
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