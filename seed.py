#!/usr/bin/env python3
"""
Script para agregar datos de prueba a la base de datos.
Ejecutar: python seed.py
"""
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product

app = create_app()

def seed():
    with app.app_context():
        # Crear todas las tablas si no existen
        db.create_all()
        
        # Verificar si ya hay datos
        if Store.query.first():
            print("Ya existen datos en la base de datos. Omitiendo seed.")
            print("Si deseas resetear, ejecuta 'flask db downgrade' y luego 'flask db upgrade'.")
            return

        print("Creando datos de prueba...\n")

        # 1. Crear Super Admin
        super_admin = User(
            email='admin@eshop.com',
            password_hash='',  # Se setea abajo
            role='SUPERADMIN',
            store_id=None
        )
        super_admin.set_password('admin123')
        db.session.add(super_admin)
        db.session.flush()
        print(f"✓ Super Admin creado: admin@eshop.com / admin123")

        # 2. Crear Tienda 1 - Moda
        store1 = Store(
            slug='moda-trendy',
            name='Moda Trendy',
            whatsapp='+573001234567'
        )
        db.session.add(store1)
        db.session.flush()

        # Vendedor de Tienda 1
        seller1 = User(
            email='vendedor@modatrendy.com',
            password_hash='',
            role='SELLER',
            store_id=store1.id
        )
        seller1.set_password('tienda123')
        db.session.add(seller1)

        # Categorías Tienda 1
        cat1_1 = Category(name='Ropa', store_id=store1.id)
        cat1_2 = Category(name='Accesorios', store_id=store1.id)
        cat1_3 = Category(name='Calzado', store_id=store1.id)
        db.session.add_all([cat1_1, cat1_2, cat1_3])
        db.session.flush()

        # Productos Tienda 1 - Moda
        products1 = [
            Product(name='Camiseta Algodón Premium', price=45000, promo_price=35000, stock=50,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Camiseta de algodón orgánico, disponible en varios colores.',
                   image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'),
            Product(name='Jeans Skinny Fit', price=89000, promo_price=69000, stock=30,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Jeans de corte moderno, tela stretch.',
                   image_url='https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop'),
            Product(name='Vestido Floral', price=65000, stock=20,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Vestido estampado floral, perfecto para primavera.',
                   image_url='https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=400&fit=crop'),
            Product(name='Chaqueta Cuero', price=180000, promo_price=149000, stock=15,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Chaqueta de cuero genuino, estilo clásico.',
                   image_url='https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'),
            Product(name='Reloj Deportivo', price=75000, stock=40,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Reloj resistente al agua, ideal para deportes.',
                   image_url='https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'),
            Product(name='Bolso Bandolera', price=55000, promo_price=45000, stock=25,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Bolso bandolera de cuero sintético, múltiples compartimientos.',
                   image_url='https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'),
            Product(name='Gafas de Sol', price=35000, stock=60,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Gafas con protección UV400, diseño moderno.',
                   image_url='https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'),
            Product(name='Zapatos Deportivos', price=120000, promo_price=95000, stock=35,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Zapatos deportivos ultraligeros, suela antideslizante.',
                   image_url='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'),
            Product(name='Sandalias Verano', price=28000, stock=45,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Sandalias cómodas para el día a día.',
                   image_url='https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop'),
            Product(name='Botines Cuero', price=150000, stock=20,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Botines de cuero con cremallera lateral.',
                   image_url='https://images.unsplash.com/photo-1608256246200-53e635b0429f?w=400&h=400&fit=crop'),
        ]
        db.session.add_all(products1)
        print(f"✓ Tienda creada: {store1.name} ({store1.slug})")

        # 3. Crear Tienda 2 - Electrónica
        store2 = Store(
            slug='tech-store',
            name='Tech Store',
            whatsapp='+573009876543'
        )
        db.session.add(store2)
        db.session.flush()

        # Vendedor de Tienda 2
        seller2 = User(
            email='vendedor@techstore.com',
            password_hash='',
            role='SELLER',
            store_id=store2.id
        )
        seller2.set_password('tienda123')
        db.session.add(seller2)

        # Categorías Tienda 2
        cat2_1 = Category(name='Celulares', store_id=store2.id)
        cat2_2 = Category(name='Audífonos', store_id=store2.id)
        cat2_3 = Category(name='Cargadores', store_id=store2.id)
        cat2_4 = Category(name='Fundas', store_id=store2.id)
        db.session.add_all([cat2_1, cat2_2, cat2_3, cat2_4])
        db.session.flush()

        # Productos Tienda 2 - Electrónica
        products2 = [
            Product(name='iPhone 15 Pro Max', price=6500000, promo_price=5990000, stock=10,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='iPhone 15 Pro Max 256GB, chip A17 Pro.',
                   image_url='https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'),
            Product(name='Samsung Galaxy S24', price=4500000, promo_price=3990000, stock=15,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Samsung Galaxy S24 256GB, pantalla Dynamic AMOLED.',
                   image_url='https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop'),
            Product(name='Xiaomi Redmi Note 13', price=1200000, stock=25,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Xiaomi Redmi Note 13 128GB, cámara 108MP.',
                   image_url='https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop'),
            Product(name='AirPods Pro 2', price=850000, promo_price=749000, stock=30,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='AirPods Pro 2da generación con cancelación de ruido.',
                   image_url='https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop'),
            Product(name='Audífonos Sony WH-1000XM5', price=1200000, stock=12,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Audífonos inalámbricos con cancelación de ruido líder.',
                   image_url='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'),
            Product(name='Audífonos JBL Tune', price=180000, promo_price=149000, stock=40,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Audífonos Bluetooth JBL con bass potenciado.',
                   image_url='https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'),
            Product(name='Cargador Rápido USB-C 65W', price=75000, stock=50,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Cargador GaN 65W, compatible con laptops y celulares.',
                   image_url='https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'),
            Product(name='Power Bank 20000mAh', price=95000, promo_price=79000, stock=35,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Batería externa 20000mAh con carga rápida.',
                   image_url='https://images.unsplash.com/photo-1609592424815-42d1b777107f?w=400&h=400&fit=crop'),
            Product(name='Cable USB-C 1m', price=15000, stock=100,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Cable USB-C a USB-C trenzado, carga rápida.',
                   image_url='https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=400&fit=crop'),
            Product(name='Funda Silicona iPhone', price=25000, stock=60,
                   category_id=cat2_4.id, store_id=store2.id,
                   description='Funda de silicona suave, varios colores.',
                   image_url='https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop'),
            Product(name='Funda Cuero Samsung', price=35000, stock=40,
                   category_id=cat2_4.id, store_id=store2.id,
                   description='Funda de cuero con soporte para tarjetas.',
                   image_url='https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop'),
            Product(name='Templado Vidrio 3D', price=10000, stock=200,
                   category_id=cat2_4.id, store_id=store2.id,
                   description='Protector de vidrio templado 3D,抗菌.',
                   image_url='https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop'),
        ]
        db.session.add_all(products2)
        print(f"✓ Tienda creada: {store2.name} ({store2.slug})")

        # 4. Crear Tienda 3 - Hogar (sin productos para probar vacío)
        store3 = Store(
            slug='hogar-y-mas',
            name='Hogar & Más',
            whatsapp='+573005554433'
        )
        db.session.add(store3)
        db.session.flush()

        seller3 = User(
            email='vendedor@hogarymas.com',
            password_hash='',
            role='SELLER',
            store_id=store3.id
        )
        seller3.set_password('tienda123')
        db.session.add(seller3)

        # Solo categorías sin productos
        cat3_1 = Category(name='Cocina', store_id=store3.id)
        cat3_2 = Category(name='Decoración', store_id=store3.id)
        db.session.add_all([cat3_1, cat3_2])
        print(f"✓ Tienda creada: {store3.name} ({store3.slug}) - Sin productos")

        db.session.commit()
        print("\n✅ Datos de prueba creados exitosamente!")
        print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Credenciales de prueba:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Super Admin:")
        print("  Email: admin@eshop.com")
        print("  Pass:  admin123")
        print()
        print("Vendedores:")
        print("  moda-trendy:  vendedor@modatrendy.com  / tienda123")
        print("  tech-store:   vendedor@techstore.com   / tienda123")
        print("  hogar-y-mas:  vendedor@hogarymas.com   / tienda123")
        print()
        print("Catálogos públicos:")
        print("  http://localhost:5173/moda-trendy")
        print("  http://localhost:5173/tech-store")
        print("  http://localhost:5173/hogar-y-mas")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    seed()