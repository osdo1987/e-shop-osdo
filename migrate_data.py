#!/usr/bin/env python3
"""
Script to migrate data from SQLite to PostgreSQL
"""
import sqlite3
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app import create_app, db
from app.models import User, Store, Category, Product

load_dotenv()

def migrate():
    # Connect to SQLite database
    sqlite_db = sqlite3.connect('prisma/dev.db')
    sqlite_db.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_db.cursor()
    
    # Create Flask app and push context
    app = create_app()
    
    with app.app_context():
        # Create all tables in PostgreSQL
        db.create_all()
        
        # Migrate Stores
        print("Migrating stores...")
        sqlite_cursor.execute("SELECT * FROM store")
        stores = sqlite_cursor.fetchall()
        
        for store in stores:
            existing = Store.query.filter_by(slug=store['slug']).first()
            if not existing:
                new_store = Store(
                    id=store['id'],
                    slug=store['slug'],
                    name=store['name'],
                    whatsapp=store.get('whatsapp')
                )
                db.session.add(new_store)
        
        db.session.commit()
        print(f"Migrated {len(stores)} stores")
        
        # Migrate Users
        print("Migrating users...")
        sqlite_cursor.execute("SELECT * FROM user")
        users = sqlite_cursor.fetchall()
        
        for user in users:
            existing = User.query.filter_by(email=user['email']).first()
            if not existing:
                new_user = User(
                    id=user['id'],
                    email=user['email'],
                    password_hash=user['passwordHash'],
                    role=user['role'],
                    store_id=user.get('storeId')
                )
                db.session.add(new_user)
        
        db.session.commit()
        print(f"Migrated {len(users)} users")
        
        # Migrate Categories
        print("Migrating categories...")
        sqlite_cursor.execute("SELECT * FROM category")
        categories = sqlite_cursor.fetchall()
        
        for category in categories:
            existing = Category.query.filter_by(id=category['id']).first()
            if not existing:
                new_category = Category(
                    id=category['id'],
                    name=category['name'],
                    store_id=category['storeId']
                )
                db.session.add(new_category)
        
        db.session.commit()
        print(f"Migrated {len(categories)} categories")
        
        # Migrate Products
        print("Migrating products...")
        sqlite_cursor.execute("SELECT * FROM product")
        products = sqlite_cursor.fetchall()
        
        for product in products:
            existing = Product.query.filter_by(id=product['id']).first()
            if not existing:
                new_product = Product(
                    id=product['id'],
                    name=product['name'],
                    description=product.get('description'),
                    price=product['price'],
                    promo_price=product.get('promoPrice'),
                    image_url=product.get('imageUrl'),
                    stock=product.get('stock', 0),
                    category_id=product['categoryId'],
                    store_id=product['storeId']
                )
                db.session.add(new_product)
        
        db.session.commit()
        print(f"Migrated {len(products)} products")
    
    sqlite_db.close()
    print("\nMigration completed successfully!")

if __name__ == '__main__':
    print("Starting data migration from SQLite to PostgreSQL...")
    print("Make sure PostgreSQL is running and DATABASE_URL is configured correctly.")
    response = input("Continue? (y/n): ")
    if response.lower() == 'y':
        migrate()
    else:
        print("Migration cancelled.")