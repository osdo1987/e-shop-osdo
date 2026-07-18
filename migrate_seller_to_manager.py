"""
Migration script: Rename SELLER role to MANAGER in the database.
Run with: python migrate_seller_to_manager.py
"""
from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
with app.app_context():
    sellers = User.query.filter_by(role='SELLER').all()
    print(f'Found {len(sellers)} SELLER users to migrate')
    for s in sellers:
        s.role = 'MANAGER'
        print(f'  Migrated: {s.email} (store_id={s.store_id})')
    db.session.commit()
    print('Migration complete!')
