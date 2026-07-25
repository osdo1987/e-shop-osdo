"""
Reset database: clear all data, keep only the superadmin user.
Then run: flask db upgrade

Usage: python reset_db.py
"""
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()

def reset():
    with app.app_context():
        print("Looking up superadmin user to preserve...")
        superadmin = User.query.filter_by(role='SUPERADMIN').first()

        if not superadmin:
            print("No superadmin found. Default credentials will be:")
            email = 'admin@eshop.com'
            password = 'admin123'
        else:
            email = superadmin.email
            password = None  # keep existing password hash
            print(f"Found superadmin: {email}")

        print("Dropping all tables...")
        db.drop_all()

        print("Recreating all tables from models...")
        db.create_all()

        print("Creating superadmin user...")
        sa = User(email=email, role='SUPERADMIN', store_id=None)
        if password:
            sa.set_password(password)
            print(f"Superadmin created: {email} / {password}")
        else:
            sa.password_hash = superadmin.password_hash
            print(f"Superadmin restored: {email} (password preserved)")

        db.session.add(sa)
        db.session.commit()

        print()
        print("=" * 50)
        print("Database reset complete!")
        print("=" * 50)
        print(f"Superadmin: {email}")
        print()
        print("Next steps:")
        print("  1. Restart the Flask app")
        print("  2. Create stores from the SuperAdmin panel")
        print("  3. Payment methods are auto-seeded when stores are created")

if __name__ == '__main__':
    reset()
