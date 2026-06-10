#!/usr/bin/env python3
"""
Script para agregar datos de prueba de un restaurante de hamburguesas.
Ejecutar: python seed_campo_burguer.py
"""
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product

app = create_app()

def seed_campo_burguer():
    with app.app_context():
        # Verificar si ya existe la tienda para no duplicar
        existing = Store.query.filter_by(slug='campo-burguer').first()
        if existing:
            print("⚠️  El restaurante 'Campo Burguer' ya existe. Saltando...")
            print(f"   Catálogo: http://localhost:5173/campo-burguer")
            return

        print("🍔 Creando Campo Burguer...\n")

        # 1. Crear Restaurante
        restaurant = Store(
            slug='campo-burguer',
            name='Campo Burguer',
            whatsapp='+573005556677',
            business_type='restaurant',
            address='Mediacanoa, Valle del Cauca',
            schedule='Lun-Dom 11am-10pm'
        )
        db.session.add(restaurant)
        db.session.flush()

        # 2. Crear vendedor
        seller = User(
            email='admin@campoburguer.com',
            password_hash='',
            role='SELLER',
            store_id=restaurant.id
        )
        seller.set_password('burguer123')
        db.session.add(seller)

        # 3. Crear categorías del menú
        cat_burgers = Category(name='Hamburguesas', store_id=restaurant.id)
        cat_combos = Category(name='Combos', store_id=restaurant.id)
        cat_entradas = Category(name='Entradas', store_id=restaurant.id)
        cat_bebidas = Category(name='Bebidas', store_id=restaurant.id)
        cat_postres = Category(name='Postres', store_id=restaurant.id)
        cat_extras = Category(name='Extras', store_id=restaurant.id)
        db.session.add_all([cat_burgers, cat_combos, cat_entradas, cat_bebidas, cat_postres, cat_extras])
        db.session.flush()

        # 4. Crear productos del menú
        products = [
            # ── Hamburguesas ──
            Product(
                name='Classic Burguer',
                price=18000, stock=50,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Carne de res 150g, lechuga, tomate, cebolla morada, queso cheddar y salsa especial de la casa.',
                image_url='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Double Cheese Burguer',
                price=25000, promo_price=22000, stock=40,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Doble carne de res 200g, doble queso cheddar, bacon crocante, pickles y salsa BBQ ahumada.',
                image_url='https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Burguer de Pollo Crispy',
                price=19000, stock=35,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Pechuga de pollo empanizada crujiente, lechuga, tomate, mayonesa casera y pickles.',
                image_url='https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Burguer Vegana',
                price=22000, stock=25,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Patty de plant-based, lechuga, tomate, cebolla caramelizada, aguacate y salsa tahini.',
                image_url='https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Burguer Italiana',
                price=21000, stock=30,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Carne de res 150g, pepperoni, queso mozzarella, salsa marinara y albahaca fresca.',
                image_url='https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Burguer BBQ Bacon',
                price=23000, promo_price=20000, stock=35,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Carne de res 150g, bacon ahumado, aros de cebolla, queso pepper jack y salsa BBQ casera.',
                image_url='https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Burguer Mexicana',
                price=20000, stock=30,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Carne de res 150g, guacamole fresco, jalapeños, queso cheddar, pico de gallo y crema agria.',
                image_url='https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Monster Burguer (1/2 libra)',
                price=32000, stock=20,
                category_id=cat_burgers.id, store_id=restaurant.id,
                description='Carne de res 250g, triple queso, bacon, huevo frito, lechuga, tomate, cebolla y salsa de la casa.',
                image_url='https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80'
            ),

            # ── Combos ──
            Product(
                name='Combo Classic + Papas + Gaseosa',
                price=25000, promo_price=22000, stock=50,
                category_id=cat_combos.id, store_id=restaurant.id,
                description='Classic Burguer + papas fritas medianas + gaseosa 400ml.',
                image_url='https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Combo Doble + Papas + Bebida',
                price=33000, promo_price=29000, stock=40,
                category_id=cat_combos.id, store_id=restaurant.id,
                description='Double Cheese Burguer + papas fritas grandes + bebida a elegir.',
                image_url='https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Combo Familiar (4 Hamburguesas)',
                price=75000, promo_price=65000, stock=15,
                category_id=cat_combos.id, store_id=restaurant.id,
                description='4 Classic Burguer + 2 papas grandes + 4 gaseosas 400ml. Ideal para compartir en familia.',
                image_url='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Combo Kids',
                price=15000, stock=30,
                category_id=cat_combos.id, store_id=restaurant.id,
                description='Mini burguer de pollo + papas pequeñas + jugo natural + sorpresa.',
                image_url='https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80'
            ),

            # ── Entradas ──
            Product(
                name='Papas Fritas Clásicas',
                price=10000, stock=60,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='Papas fritas doradas y crujientes con sal marina. Porción regular.',
                image_url='https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Papas con Queso y Bacon',
                price=15000, promo_price=13000, stock=40,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='Papas fritas cubiertas con queso cheddar derretido y bacon crocante.',
                image_url='https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Aros de Cebolla',
                price=12000, stock=35,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='Aros de cebolla empanizados y fritos hasta quedar dorados. Servidos con salsa ranch.',
                image_url='https://images.unsplash.com/photo-1639024471283-03518883512d?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Nuggets de Pollo x8',
                price=13000, stock=45,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='8 nuggets de pollo empanizados crujientes, servidos con salsa BBQ y mostaza.',
                image_url='https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Nachos Supreme',
                price=16000, stock=30,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='Totopos de maíz con queso cheddar, guacamole, crema agria, pico de jalapeños y carne molida.',
                image_url='https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Alitas BBQ x12',
                price=18000, promo_price=16000, stock=35,
                category_id=cat_entradas.id, store_id=restaurant.id,
                description='12 alitas de pollo bañadas en salsa BBQ ahumada, servidas con aderezo de limón.',
                image_url='https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80'
            ),

            # ── Bebidas ──
            Product(
                name='Gaseosa Personal 400ml',
                price=4000, stock=100,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Gaseosa personal a elegir: Coca-Cola, Sprite, Fanta o Perrier.',
                image_url='https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Limonada Natural',
                price=5000, stock=50,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Limonada natural fresca con hielo, endulzada al gusto.',
                image_url='https://images.unsplash.com/photo-1621198285419-74f672270116?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Limonada de Coco',
                price=7000, stock=40,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Limonada natural mezclada con leche de coco fresca, refrescante y tropical.',
                image_url='https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Cerveza Águila',
                price=4000, stock=80,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Cerveza nacional bien fría, lager premium de 330ml.',
                image_url='https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Cerveza Póker',
                price=3500, stock=80,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Cerveza Póker lager 330ml, refrescante y ligera.',
                image_url='https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Agua Botella 600ml',
                price=2500, stock=100,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Agua mineral natural sin gas, botella de 600ml.',
                image_url='https://images.unsplash.com/photo-1523362628745-0c100fc988a6?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Jugo Natural en Agua',
                price=5000, stock=50,
                category_id=cat_bebidas.id, store_id=restaurant.id,
                description='Jugo natural en agua a elegir: lulo, maracuyá, mango o guanábana.',
                image_url='https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=80'
            ),

            # ── Postres ──
            Product(
                name='Brownie con Helado',
                price=12000, promo_price=10000, stock=30,
                category_id=cat_postres.id, store_id=restaurant.id,
                description='Brownie de chocolate caliente con bola de helado de vainilla y salsa de chocolate.',
                image_url='https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Malteada de Chocolate',
                price=10000, stock=40,
                category_id=cat_postres.id, store_id=restaurant.id,
                description='Malteada espesa de chocolate con crema batida y chispas de chocolate.',
                image_url='https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Helado Artesanal x2 Bolas',
                price=8000, stock=35,
                category_id=cat_postres.id, store_id=restaurant.id,
                description='Dos bolas de helado artesanal a elegir: vainilla, chocolate, fresa, cookies & cream.',
                image_url='https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Churros con Chocolate x6',
                price=9000, stock=25,
                category_id=cat_postres.id, store_id=restaurant.id,
                description='6 churros crujientes espolvoreados con azúcar, servidos con salsa de chocolate caliente.',
                image_url='https://images.unsplash.com/photo-1624371414361-e670c5dbf7b1?w=500&auto=format&fit=crop&q=80'
            ),

            # ── Extras ──
            Product(
                name='Extra Queso Cheddar',
                price=3000, stock=60,
                category_id=cat_extras.id, store_id=restaurant.id,
                description='Porción extra de queso cheddar derretido para tu hamburguesa.',
                image_url='https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Extra Bacon',
                price=3500, stock=50,
                category_id=cat_extras.id, store_id=restaurant.id,
                description='3 tiras de bacon crocante ahumado adicionales.',
                image_url='https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Extra Aguacate',
                price=3500, stock=40,
                category_id=cat_extras.id, store_id=restaurant.id,
                description='Rodajas frescas de aguacate para tu hamburguesa o papas.',
                image_url='https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80'
            ),
            Product(
                name='Salsa Extra (BBQ/Ranch/Chimichurri)',
                price=2000, stock=100,
                category_id=cat_extras.id, store_id=restaurant.id,
                description='Salsa extra a elegir: BBQ ahumada, Ranch casera o Chimichurri.',
                image_url='https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500&auto=format&fit=crop&q=80'
            ),
        ]
        db.session.add_all(products)
        db.session.commit()

        print("✅ Campo Burguer creado exitosamente!\n")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("🍔 Campo Burguer")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"Tipo:       Restaurante de Hamburguesas")
        print(f"Dirección:  Mediacanoa, Valle del Cauca")
        print(f"Horario:    Lun-Dom 11am-10pm")
        print(f"WhatsApp:   +573005556677")
        print()
        print("Credenciales del vendedor:")
        print(f"  Email:    admin@campoburguer.com")
        print(f"  Password: burguer123")
        print()
        print("Menú público:")
        print("  http://localhost:5173/campo-burguer")
        print()
        print("Categorías del menú:")
        cats = Category.query.filter_by(store_id=restaurant.id).all()
        for c in cats:
            count = Product.query.filter_by(category_id=c.id, store_id=restaurant.id).count()
            print(f"  • {c.name}: {count} productos")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    seed_campo_burguer()