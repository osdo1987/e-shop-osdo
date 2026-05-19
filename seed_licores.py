#!/usr/bin/env python3
"""
Script para agregar datos de prueba de una TIENDA DE LICORES.
Ejecutar: python seed_licores.py
Crea una nueva tienda de licores con +20 productos.
"""
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product

app = create_app()

def seed_licores():
    with app.app_context():
        # Verificar si la tienda ya existe para no duplicar
        existing = Store.query.filter_by(slug='licores-elite').first()
        if existing:
            print("⚠️  La tienda 'Licores Elite' ya existe. Elimínala primero o usa otro slug.")
            print("    Para resetear la BD completa: python seed.py")
            return

        print("🏪 Creando Tienda de Licores...\n")

        # ========================================
        # 1. Crear Tienda de Licores
        # ========================================
        licor_store = Store(
            slug='licores-elite',
            name='Licores Élite',
            whatsapp='+573001112233'
        )
        db.session.add(licor_store)
        db.session.flush()

        print(f"  ✓ Tienda creada: {licor_store.name}")

        # ========================================
        # 2. Crear Vendedor
        # ========================================
        licor_seller = User(
            email='vendedor@licoreselite.com',
            password_hash='',
            role='SELLER',
            store_id=licor_store.id
        )
        licor_seller.set_password('tienda123')
        db.session.add(licor_seller)
        print(f"  ✓ Vendedor creado: vendedor@licoreselite.com / tienda123")

        # ========================================
        # 3. Crear Categorías
        # ========================================
        cat_whisky    = Category(name='Whisky',    store_id=licor_store.id)
        cat_ron       = Category(name='Ron',       store_id=licor_store.id)
        cat_vodka     = Category(name='Vodka',     store_id=licor_store.id)
        cat_cerveza   = Category(name='Cerveza',   store_id=licor_store.id)
        cat_vino      = Category(name='Vino',      store_id=licor_store.id)
        cat_tequila   = Category(name='Tequila',   store_id=licor_store.id)
        cat_licores   = Category(name='Licores',   store_id=licor_store.id)
        cat_sin_alcohol = Category(name='Sin Alcohol', store_id=licor_store.id)

        db.session.add_all([
            cat_whisky, cat_ron, cat_vodka, cat_cerveza,
            cat_vino, cat_tequila, cat_licores, cat_sin_alcohol
        ])
        db.session.flush()
        print(f"  ✓ 8 categorías creadas")

        # ========================================
        # 4. Crear Productos (24 productos)
        # ========================================

        # --- WHISKY (4 productos) ---
        productos = [
            Product(
                name='Johnnie Walker Black Label 750ml',
                price=185000, promo_price=159900, stock=20,
                category_id=cat_whisky.id, store_id=licor_store.id,
                description='Whisky escocés blend añejado 12 años. Notas de vainilla, miel y roble.',
                image_url='https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop',
            ),
            Product(
                name='Jack Daniel\'s Old No. 7 750ml',
                price=145000, promo_price=129900, stock=25,
                category_id=cat_whisky.id, store_id=licor_store.id,
                description='Tennessee Whiskey caramelizado con carbón de arce. Sabor suave y dulce.',
                image_url='https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop',
            ),
            Product(
                name='Buchanan\'s Master 750ml',
                price=220000, promo_price=189900, stock=15,
                category_id=cat_whisky.id, store_id=licor_store.id,
                description='Whisky escocés de lujo, añejado 12 años. Sabor ahumado con toques de fruta.',
                image_url='https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop',
            ),
            Product(
                name='Jameson Irish Whiskey 750ml',
                price=135000, stock=30,
                category_id=cat_whisky.id, store_id=licor_store.id,
                description='Whisky irlandés triple destilado. Suave, con notas de vainilla y nuez.',
                image_url='https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop',
            ),

            # --- RON (3 productos) ---
            Product(
                name='Bacardí Carta Blanca 750ml',
                price=85000, promo_price=74900, stock=40,
                category_id=cat_ron.id, store_id=licor_store.id,
                description='Ron blanco premium. Ideal para mojitos y cócteles tropicales.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),
            Product(
                name='Havana Club Añejo 7 Años 750ml',
                price=165000, promo_price=149900, stock=18,
                category_id=cat_ron.id, store_id=licor_store.id,
                description='Ron cubano añejado 7 años. Sabor complejo con notas de roble y caramelo.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),
            Product(
                name='Captain Morgan Spiced Gold 750ml',
                price=95000, stock=35,
                category_id=cat_ron.id, store_id=licor_store.id,
                description='Ron especiado con sabor a vainilla, canela y nuez moscada.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),

            # --- VODKA (3 productos) ---
            Product(
                name='Absolut Vodka 750ml',
                price=90000, promo_price=79900, stock=50,
                category_id=cat_vodka.id, store_id=licor_store.id,
                description='Vodka sueco premium. Destilado con trigo de invierno. Sabor puro y limpio.',
                image_url='https://images.unsplash.com/photo-1582819509237-d3f6e9e4c39d?w=400&h=400&fit=crop',
            ),
            Product(
                name='Smirnoff Red No. 21 750ml',
                price=65000, stock=60,
                category_id=cat_vodka.id, store_id=licor_store.id,
                description='Vodka americano triple destilado. Suave y versátil para cócteles.',
                image_url='https://images.unsplash.com/photo-1582819509237-d3f6e9e4c39d?w=400&h=400&fit=crop',
            ),
            Product(
                name='Grey Goose L\'Orange 750ml',
                price=210000, promo_price=189900, stock=10,
                category_id=cat_vodka.id, store_id=licor_store.id,
                description='Vodka premium francés sabor naranja. Elegante y sofisticado.',
                image_url='https://images.unsplash.com/photo-1582819509237-d3f6e9e4c39d?w=400&h=400&fit=crop',
            ),

            # --- CERVEZA (3 productos) ---
            Product(
                name='Corona Extra 6 Pack 355ml',
                price=45000, promo_price=39900, stock=100,
                category_id=cat_cerveza.id, store_id=licor_store.id,
                description='Cerveza mexicana suave y refrescante. Ideal con limón.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),
            Product(
                name='Heineken 6 Pack 330ml',
                price=48000, stock=80,
                category_id=cat_cerveza.id, store_id=licor_store.id,
                description='Cerveza lager holandesa. Sabor equilibrado con toque amargo.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),
            Product(
                name='Stella Artois 6 Pack 330ml',
                price=55000, promo_price=49900, stock=60,
                category_id=cat_cerveza.id, store_id=licor_store.id,
                description='Cerveza belga tipo lager premium. Notas de malta y lúpulo.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),

            # --- VINO (3 productos) ---
            Product(
                name='Concha y Toro Casillero del Diablo Cabernet 750ml',
                price=55000, promo_price=47900, stock=30,
                category_id=cat_vino.id, store_id=licor_store.id,
                description='Vino tinto chileno. Cuerpo medio con notas de cereza y roble.',
                image_url='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
            ),
            Product(
                name='Santa Rita 120 Sauvignon Blanc 750ml',
                price=45000, stock=35,
                category_id=cat_vino.id, store_id=licor_store.id,
                description='Vino blanco chileno fresco y cítrico. Notas de maracuyá y lima.',
                image_url='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
            ),
            Product(
                name='Navarro Correa Finca el Origen Malbec 750ml',
                price=75000, promo_price=64900, stock=25,
                category_id=cat_vino.id, store_id=licor_store.id,
                description='Vino tinto argentino. Crianza en barricas de roble. Sabor intenso.',
                image_url='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
            ),

            # --- TEQUILA (2 productos) ---
            Product(
                name='José Cuervo Especial Reposado 750ml',
                price=115000, promo_price=99900, stock=20,
                category_id=cat_tequila.id, store_id=licor_store.id,
                description='Tequila reposado mexicano. Añejado en barricas de roble.',
                image_url='https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop',
            ),
            Product(
                name='Patrón Silver 750ml',
                price=280000, promo_price=249900, stock=12,
                category_id=cat_tequila.id, store_id=licor_store.id,
                description='Tequila premium 100% agave azul. Sabor suave con notas de agave.',
                image_url='https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop',
            ),

            # --- LICORES (3 productos) ---
            Product(
                name='Baileys Irish Cream 750ml',
                price=110000, promo_price=97900, stock=25,
                category_id=cat_licores.id, store_id=licor_store.id,
                description='Crema de whisky irlandés con notas de chocolate y vainilla.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),
            Product(
                name='Jägermeister 700ml',
                price=95000, stock=30,
                category_id=cat_licores.id, store_id=licor_store.id,
                description='Licor de hierbas alemán con 56 ingredientes naturales.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),
            Product(
                name='Campari 750ml',
                price=78000, stock=20,
                category_id=cat_licores.id, store_id=licor_store.id,
                description='Aperitivo italiano con sabor amaro. Ideal para Negroni y cócteles.',
                image_url='https://images.unsplash.com/photo-1578911595541-64bee29b82de?w=400&h=400&fit=crop',
            ),

            # --- SIN ALCOHOL (3 productos) ---
            Product(
                name='Club Colombia Cero 6 Pack 330ml',
                price=32000, stock=90,
                category_id=cat_sin_alcohol.id, store_id=licor_store.id,
                description='Cerveza sin alcohol con todo el sabor de Club Colombia.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),
            Product(
                name='Agua Tónica Canada Dry 1.5L',
                price=8500, stock=150,
                category_id=cat_sin_alcohol.id, store_id=licor_store.id,
                description='Agua tónica premium para mezclar con gin o vodka.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),
            Product(
                name='Tampico Sabor Ponche 1.5L',
                price=12000, promo_price=9900, stock=200,
                category_id=cat_sin_alcohol.id, store_id=licor_store.id,
                description='Refresco sabor ponche de frutas. Ideal para mezclar.',
                image_url='https://images.unsplash.com/photo-1586999768265-24af89630739?w=400&h=400&fit=crop',
            ),
        ]

        db.session.add_all(productos)
        db.session.commit()

        # ========================================
        # 5. Resumen
        # ========================================
        total = Product.query.filter_by(store_id=licor_store.id).count()
        categorias = Category.query.filter_by(store_id=licor_store.id).count()

        print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"✅ Tienda de Licores creada exitosamente!")
        print(f"\n📊 Resumen:")
        print(f"  • Tienda:       {licor_store.name}")
        print(f"  • Slug:         {licor_store.slug}")
        print(f"  • Categorías:   {categorias}")
        print(f"  • Productos:    {total}")
        print()
        print("🔑 Credenciales:")
        print(f"  Email: vendedor@licoreselite.com")
        print(f"  Pass:  tienda123")
        print()
        print("🌐 Catálogo público:")
        print(f"  http://localhost:5173/licores-elite")
        print("\n📦 Productos por categoría:")
        cats = Category.query.filter_by(store_id=licor_store.id).all()
        for c in cats:
            count = Product.query.filter_by(category_id=c.id, store_id=licor_store.id).count()
            print(f"  • {c.name}: {count} productos")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    seed_licores()