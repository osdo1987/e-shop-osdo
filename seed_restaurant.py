#!/usr/bin/env python3
"""
Script para agregar datos de prueba de un restaurante.
Ejecutar: python seed_restaurant.py
"""
import json
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product

app = create_app()

def seed_restaurant():
    with app.app_context():
        # Verificar si ya existe un restaurante de prueba
        existing = Store.query.filter_by(slug='restaurante-sabores').first()
        if existing:
            print("⚠️  El restaurante de prueba ya existe.")
            print(f"   Actualizando productos con toppings...\n")
            restaurant = existing
            # No eliminar productos, solo actualizar los que existen
        else:
            print("🍽️  Creando restaurante de prueba...\n")
            # 1. Crear Restaurante
            restaurant = Store(
                slug='restaurante-sabores',
                name='Restaurante Sabores del Valle',
                whatsapp='+573009991122',
                business_type='restaurant',
                address='Carrera 7 #45-12, Centro, Bogotá',
                schedule='Lun-Vie 11am-10pm | Sáb-Dom 10am-11pm'
            )
            db.session.add(restaurant)
            db.session.flush()

        # 2. Crear vendedor (si no existe)
        existing_seller = User.query.filter_by(email='chef@sabores.com').first()
        if existing_seller:
            seller = existing_seller
            seller.store_id = restaurant.id
            seller.role = 'SELLER'
            seller.set_password('restaurante123')
        else:
            seller = User(
                email='chef@sabores.com',
                password_hash='',
                role='SELLER',
                store_id=restaurant.id
            )
            seller.set_password('restaurante123')
            db.session.add(seller)

        # 3. Crear categorías del menú
        cat_entradas = Category(name='Entradas', store_id=restaurant.id)
        cat_platos = Category(name='Platos Fuertes', store_id=restaurant.id)
        cat_pizzas = Category(name='Pizzas', store_id=restaurant.id)
        cat_bebidas = Category(name='Bebidas', store_id=restaurant.id)
        cat_postres = Category(name='Postres', store_id=restaurant.id)
        db.session.add_all([cat_entradas, cat_platos, cat_pizzas, cat_bebidas, cat_postres])
        db.session.flush()

        # 4. Crear productos del menú
        # ── Config de toppings de ejemplo ──
        toppings_proteinas = json.dumps({
            "groups": [
                {
                    "id": "protein",
                    "label": "Elige tus proteínas (máx 3)",
                    "max": 3,
                    "min": 1,
                    "required": True,
                    "options": [
                        {"name": "Pollo", "price": 0},
                        {"name": "Carne", "price": 0},
                        {"name": "Chorizo", "price": 0},
                        {"name": "Cerdo", "price": 0},
                        {"name": "Mixta", "price": 0},
                        {"name": "Extra Carne", "price": 3000},
                        {"name": "Extra Pollo", "price": 2500}
                    ]
                },
                {
                    "id": "sauces",
                    "label": "Salsas",
                    "max": 0,
                    "min": 0,
                    "required": False,
                    "options": [
                        {"name": "Mayonesa", "price": 0},
                        {"name": "Ketchup", "price": 0},
                        {"name": "Salsa de la casa", "price": 0},
                        {"name": "Salsa BBQ", "price": 500},
                        {"name": "Salsa de Ajo", "price": 500}
                    ]
                },
                {
                    "id": "extras",
                    "label": "Extras",
                    "max": 3,
                    "min": 0,
                    "required": False,
                    "options": [
                        {"name": "Queso extra", "price": 2000},
                        {"name": "Tocineta", "price": 2500},
                        {"name": "Huevo frito", "price": 1500},
                        {"name": "Aguacate", "price": 2000}
                    ]
                }
            ]
        })

        toppings_pizza = json.dumps({
            "groups": [
                {
                    "id": "ingredients",
                    "label": "Ingredientes adicionales",
                    "max": 5,
                    "min": 0,
                    "required": False,
                    "options": [
                        {"name": "Pepperoni extra", "price": 3000},
                        {"name": "Champiñones", "price": 2000},
                        {"name": "Aceitunas", "price": 1500},
                        {"name": "Pimiento", "price": 1000},
                        {"name": "Cebolla caramelizada", "price": 2000},
                        {"name": "Piña", "price": 1500}
                    ]
                },
                {
                    "id": "cheese",
                    "label": "Tipo de queso",
                    "max": 1,
                    "min": 0,
                    "required": False,
                    "options": [
                        {"name": "Mozzarella extra", "price": 2000},
                        {"name": "Queso azul", "price": 3000},
                        {"name": "Queso parmesano", "price": 2500}
                    ]
                }
            ]
        })

        # Verificar si los productos ya existen
        existing_products = {p.name: p for p in Product.query.filter_by(store_id=restaurant.id).all()}
        
        products_to_add = []
        
        def get_or_create_product(name, **kwargs):
            if name in existing_products:
                # Actualizar producto existente
                product = existing_products[name]
                for key, value in kwargs.items():
                    setattr(product, key, value)
                return None  # No agregar, ya existe
            else:
                # Crear nuevo producto
                return Product(name=name, **kwargs)
        
        # ── Entradas ──
        empanadas = get_or_create_product(
            'Empanadas Colombianas x6',
            price=12000, stock=50,
            category_id=cat_entradas.id, store_id=restaurant.id,
            description='Seis empanadas crujientes rellenas de carne sazonada con hogao y papa.',
            image_url='https://images.unsplash.com/photo-1604467707321-70d009801bf4?w=500&auto=format&fit=crop&q=80'
        )
        if empanadas: products_to_add.append(empanadas)
        
        patacones = get_or_create_product(
            'Patacones con Hogao',
            price=15000, promo_price=13000, stock=40,
            category_id=cat_entradas.id, store_id=restaurant.id,
            description='Tostones de plátano verde crujientes con hogao de tomate y cebolla.',
            image_url='https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=500&auto=format&fit=crop&q=80'
        )
        if patacones: products_to_add.append(patacones)
        
        marranitas = get_or_create_product(
            name='Marranitas de Plátano',
            price=14000, stock=35,
            category_id=cat_entradas.id, store_id=restaurant.id,
            description='Bolitas de plátano verde frito rellenas de chicharrón picado.',
            image_url='https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80'
        )
        if marranitas: products_to_add.append(marranitas)
        
        tequenos = get_or_create_product(
            name='Tequeños de Queso x8',
            price=16000, stock=45,
            category_id=cat_entradas.id, store_id=restaurant.id,
            description='Palitos de masa crocante rellenos de queso derretido, servidos con salsa rosada.',
            image_url='https://images.unsplash.com/photo-1531749668029-2db88e4475b3?w=500&auto=format&fit=crop&q=80'
        )
        if tequenos: products_to_add.append(tequenos)
        
        yuca = get_or_create_product(
            name='Yuca Frita con Picó',
            price=13000, stock=30,
            category_id=cat_entradas.id, store_id=restaurant.id,
            description='Bastones de yuca frita dorada acompañados de picó colombiano.',
            image_url='https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=80'
        )
        if yuca: products_to_add.append(yuca)
        
        # ── Platos Fuertes ──
        salchipapa = get_or_create_product(
            name='Salchipapa Especial',
            price=18000, promo_price=15000, stock=50,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Papas a la francesa con salchicha, cubierta con tus proteínas favoritas, salsas y extras.',
            image_url='https://images.unsplash.com/photo-1633514660022-0f3a0e0a5b5a?w=500&auto=format&fit=crop&q=80',
            toppings_config=toppings_proteinas
        )
        if salchipapa: products_to_add.append(salchipapa)
        
        bandeja = get_or_create_product(
            name='Bandeja Paisa',
            price=35000, promo_price=32000, stock=30,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='El plato tradicional: fríjoles, arroz, carne molida, chorizo, huevo frito, plátano maduro, aguacate y arepa.',
            image_url='https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80'
        )
        if bandeja: products_to_add.append(bandeja)
        
        ajiaco = get_or_create_product(
            name='Ajiaco Santafereño',
            price=30000, stock=25,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Sopa espesa de pollo con tres tipos de papa, mazorca, guascas y crema de leche.',
            image_url='https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80'
        )
        if ajiaco: products_to_add.append(ajiaco)
        
        sancocho = get_or_create_product(
            name='Sancocho de Gallina',
            price=32000, stock=20,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Sancocho tradicional con gallina criolla, yuca, plátano verde, mazorca y cilantro.',
            image_url='https://images.unsplash.com/photo-1603105037880-880cd4f1be2c?w=500&auto=format&fit=crop&q=80'
        )
        if sancocho: products_to_add.append(sancocho)
        
        lomo = get_or_create_product(
            name='Lomo al Trapo',
            price=42000, stock=15,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Lomo de res envuelto en sal cocinado al carbón, servido con papas al romero y ensalada.',
            image_url='https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80'
        )
        if lomo: products_to_add.append(lomo)
        
        arroz = get_or_create_product(
            name='Arroz con Pollo',
            price=25000, promo_price=22000, stock=35,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Arroz amarillo con pollo desmechado, verduras, cerveza y limón.',
            image_url='https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&auto=format&fit=crop&q=80'
        )
        if arroz: products_to_add.append(arroz)
        
        punta = get_or_create_product(
            name='Punta de Anca a la Brasa',
            price=45000, stock=18,
            category_id=cat_platos.id, store_id=restaurant.id,
            description='Corte premium de punta de anca asada al carbón con chimichurri casero y papas gajo.',
            image_url='https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'
        )
        if punta: products_to_add.append(punta)
        
        # ── Pizzas ──
        pizza_margarita = get_or_create_product(
            name='Pizza Margarita',
            price=28000, stock=40,
            category_id=cat_pizzas.id, store_id=restaurant.id,
            description='Masa artesanal con salsa de tomate San Marzano, mozzarella fresca y albahaca.',
            image_url='https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80'
        )
        if pizza_margarita: products_to_add.append(pizza_margarita)
        
        pizza_pepperoni = get_or_create_product(
            name='Pizza Pepperoni',
            price=32000, promo_price=29000, stock=35,
            category_id=cat_pizzas.id, store_id=restaurant.id,
            description='Pizza con doble capa de pepperoni artesanal, mozzarella y orégano.',
            image_url='https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80'
        )
        if pizza_pepperoni: products_to_add.append(pizza_pepperoni)
        
        pizza_hawaiian = get_or_create_product(
            name='Pizza Hawaiian',
            price=30000, stock=25,
            category_id=cat_pizzas.id, store_id=restaurant.id,
            description='Piña caramelizada, jamón premium y queso mozzarella sobre masa crujiente.',
            image_url='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80'
        )
        if pizza_hawaiian: products_to_add.append(pizza_hawaiian)
        
        pizza_veg = get_or_create_product(
            name='Pizza Vegetariana',
            price=30000, stock=30,
            category_id=cat_pizzas.id, store_id=restaurant.id,
            description='Pimiento, champiñón, aceituna negra, cebolla morada, tomate cherry y mozzarella.',
            image_url='https://images.unsplash.com/photo-1511689660979-10d2b1aada4d?w=500&auto=format&fit=crop&q=80'
        )
        if pizza_veg: products_to_add.append(pizza_veg)
        
        # ── Bebidas ──
        limonada = get_or_create_product(
            name='Limonada de Coco',
            price=8000, stock=60,
            category_id=cat_bebidas.id, store_id=restaurant.id,
            description='Limonada natural con leche de coco fresca y hielo, refrescante y tropical.',
            image_url='https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80'
        )
        if limonada: products_to_add.append(limonada)
        
        lulo = get_or_create_product(
            name='Jugo de Lulo',
            price=6000, stock=50,
            category_id=cat_bebidas.id, store_id=restaurant.id,
            description='Jugo natural de lulo fresco con hielo, el sabor tropical por excelencia.',
            image_url='https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=80'
        )
        if lulo: products_to_add.append(lulo)
        
        cerveza = get_or_create_product(
            name='Cerveza Artesanal',
            price=9000, stock=40,
            category_id=cat_bebidas.id, store_id=restaurant.id,
            description='Cerveza artesanal local tipo Lager, crujiente y refrescante.',
            image_url='https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80'
        )
        if cerveza: products_to_add.append(cerveza)
        
        agua = get_or_create_product(
            name='Agua Mineral',
            price=3000, stock=100,
            category_id=cat_bebidas.id, store_id=restaurant.id,
            description='Agua mineral natural sin gas, botella de 600ml.',
            image_url='https://images.unsplash.com/photo-1523362628745-0c100fc988a6?w=500&auto=format&fit=crop&q=80'
        )
        if agua: products_to_add.append(agua)
        
        gaseosa = get_or_create_product(
            name='Gaseosa Cola',
            price=4000, stock=80,
            category_id=cat_bebidas.id, store_id=restaurant.id,
            description='Gaseosa sabor cola 350ml, bien fría.',
            image_url='https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'
        )
        if gaseosa: products_to_add.append(gaseosa)
        
        # ── Postres ──
        natas = get_or_create_product(
            name='Postre de Natas',
            price=10000, stock=30,
            category_id=cat_postres.id, store_id=restaurant.id,
            description='Postre tradicional colombiano con capas de natas, azúcar y canela.',
            image_url='https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80'
        )
        if natas: products_to_add.append(natas)
        
        cholado = get_or_create_product(
            name='Cholado',
            price=12000, promo_price=10000, stock=25,
            category_id=cat_postres.id, store_id=restaurant.id,
            description='Copa de frutas frescas tropicales con hielo raspado, leche condensada y salsas de frutas.',
            image_url='https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&auto=format&fit=crop&q=80'
        )
        if cholado: products_to_add.append(cholado)
        
        tres_leches = get_or_create_product(
            name='Tres Leches',
            price=11000, stock=20,
            category_id=cat_postres.id, store_id=restaurant.id,
            description='Bizcocho esponjoso bañado en tres leches con merengue italiano torrado.',
            image_url='https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=80'
        )
        if tres_leches: products_to_add.append(tres_leches)
        
        helado = get_or_create_product(
            name='Helado Artesanal x2 Bolas',
            price=8000, stock=40,
            category_id=cat_postres.id, store_id=restaurant.id,
            description='Dos bolas de helado artesanal a elegir: vainilla, chocolate, fresa o mango.',
            image_url='https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&auto=format&fit=crop&q=80'
        )
        if helado: products_to_add.append(helado)
        
        if products_to_add:
            db.session.add_all(products_to_add)
        
        db.session.commit()

        print("✅ Restaurante de prueba actualizado exitosamente!\n")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("🍽️  Restaurante Sabores del Valle")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"Tipo:     Restaurante")
        print(f"Dirección: Carrera 7 #45-12, Centro, Bogotá")
        print(f"Horario:  Lun-Vie 11am-10pm | Sáb-Dom 10am-11pm")
        print(f"WhatsApp: +573009991122")
        print()
        print("Credenciales del vendedor:")
        print(f"  Email:    chef@sabores.com")
        print(f"  Password: restaurante123")
        print()
        print("Menú público:")
        print("  http://localhost:5173/restaurante-sabores")
        print()
        print("Categorías del menú:")
        print("  • Entradas (5 platos)")
        print("  • Platos Fuertes (6 platos)")
        print("  • Pizzas (4 opciones)")
        print("  • Bebidas (5 opciones)")
        print("  • Postres (4 opciones)")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    seed_restaurant()