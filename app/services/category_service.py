from app.extensions import db
from app.models.category import Category
from app.schemas.category_schema import CategorySchema

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

class CategoryService:
    @staticmethod
    def get_categories_by_store(store_id):
        """Get all categories for a store"""
        categories = Category.query.filter_by(store_id=store_id).all()
        return categories_schema.dump(categories)
    
    @staticmethod
    def get_category_by_id(category_id):
        """Get category by ID"""
        category = Category.query.get(category_id)
        if category:
            return category_schema.dump(category)
        return None
    
    @staticmethod
    def create_category(store_id, data):
        """Create a new category"""
        category = Category(
            name=data['name'],
            store_id=store_id
        )
        db.session.add(category)
        db.session.commit()
        return category_schema.dump(category)
    
    @staticmethod
    def update_category(category_id, data):
        """Update a category"""
        category = Category.query.get(category_id)
        if not category:
            return None
        
        if 'name' in data:
            category.name = data['name']
        
        db.session.commit()
        return category_schema.dump(category)
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category"""
        category = Category.query.get(category_id)
        if not category:
            return False
        
        db.session.delete(category)
        db.session.commit()
        return True