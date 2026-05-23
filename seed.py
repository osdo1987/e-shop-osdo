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
        # Borrar todas las tablas para crear nuevos datos de prueba
        print("Borrando base de datos existente...")
        db.drop_all()
        # Crear todas las tablas
        print("Creando tablas...")
        db.create_all()

        print("Creando nuevos datos de prueba...\n")

        # 1. Crear Super Admin
        super_admin = User(
            email='admin@eshop.com',
            password_hash='',
            role='SUPERADMIN',
            store_id=None
        )
        super_admin.set_password('admin123')
        db.session.add(super_admin)
        db.session.flush()
        print(f"✓ Super Admin creado: admin@eshop.com / admin123")

        # 2. Crear Tienda 1 - Ferretería
        store1 = Store(
            slug='ferreteria-master',
            name='Ferretería Master',
            whatsapp='+573001112233'
        )
        db.session.add(store1)
        db.session.flush()

        seller1 = User(
            email='vendedor@ferreteria.com',
            password_hash='',
            role='SELLER',
            store_id=store1.id
        )
        seller1.set_password('tienda123')
        db.session.add(seller1)

        cat1_1 = Category(name='Herramientas Manuales', store_id=store1.id)
        cat1_2 = Category(name='Materiales Eléctricos', store_id=store1.id)
        cat1_3 = Category(name='Pinturas', store_id=store1.id)
        db.session.add_all([cat1_1, cat1_2, cat1_3])
        db.session.flush()

        products1 = [
            # Herramientas Manuales
            Product(name='Martillo de Acero', price=25000, stock=50,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Martillo de acero forjado con mango ergonómico anti-vibración.',
                   image_url='https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=80'),
            Product(name='Destornillador Estrella', price=12000, stock=100,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Destornillador de estrella con punta imantada de alta precisión.',
                   image_url='https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500&auto=format&fit=crop&q=80'),
            Product(name='Llave Expansiva 10"', price=32000, stock=40,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Llave ajustable cromada de 10 pulgadas para fontanería y mecánica.',
                   image_url='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80'),
            Product(name='Sierra Manual 18"', price=28000, stock=35,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Sierra de corte manual de 18 pulgadas con hoja de acero endurecido.',
                   image_url='https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80'),
            Product(name='Nivel de Burbuja 60cm', price=22000, stock=55,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Nivel de aluminio con 3 ampollas de burbuja para medición horizontal y vertical.',
                   image_url='https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=80'),
            Product(name='Juego de Llaves Fijas x12', price=55000, stock=25,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Set de 12 llaves de boca fija en acero cromo-vanadio, medidas 6 a 22mm.',
                   image_url='https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=500&auto=format&fit=crop&q=80'),
            Product(name='Alicate Punta Plana', price=18000, stock=70,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Alicate de punta plana con mango aislado 1000V para trabajos eléctricos.',
                   image_url='https://images.unsplash.com/photo-1611664438706-10de8c4f7e69?w=500&auto=format&fit=crop&q=80'),
            Product(name='Taladro de Mano Manual', price=42000, stock=30,
                   category_id=cat1_1.id, store_id=store1.id,
                   description='Taladro de pecho manual con mandril de 10mm, ideal para madera.',
                   image_url='https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80'),
            # Materiales Eléctricos
            Product(name='Cable Eléctrico 12 AWG (Metro)', price=3000, stock=500,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Cable de cobre flexible calibre 12 aislado en PVC, varios colores.',
                   image_url='https://images.unsplash.com/photo-1625480860249-8f866b25ac0b?w=500&auto=format&fit=crop&q=80'),
            Product(name='Toma Corriente Doble', price=8000, stock=80,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Tomacorriente blanco de pared doble con polo a tierra.',
                   image_url='https://images.unsplash.com/photo-1558244402-286dd748c593?w=500&auto=format&fit=crop&q=80'),
            Product(name='Multímetro Digital', price=65000, stock=20,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Tester multímetro digital para medir voltaje, corriente y resistencia.',
                   image_url='https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=80'),
            Product(name='Interruptor Sencillo', price=5500, stock=120,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Interruptor de pared sencillo blanco, 15A 120V, instalación sencilla.',
                   image_url='https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80'),
            Product(name='Breaker Bipolar 20A', price=28000, stock=45,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Interruptor termomagnético bipolar 20 amperios para tableros eléctricos.',
                   image_url='https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cinta Aislante x3 Unidades', price=6000, stock=200,
                   category_id=cat1_2.id, store_id=store1.id,
                   description='Pack de 3 cintas aislantes de PVC en colores negro, rojo y verde.',
                   image_url='https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop&q=80'),
            # Pinturas
            Product(name='Pintura Blanca 1 Galón', price=45000, stock=30,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Pintura acrílica blanca tipo 1 de alta cobertura para interiores.',
                   image_url='https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop&q=80'),
            Product(name='Rodillo para Pintar Profesional', price=15000, stock=45,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Rodillo de felpa de alta densidad con bandeja incluida.',
                   image_url='https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=500&auto=format&fit=crop&q=80'),
            Product(name='Brocha Angular 3"', price=9500, stock=60,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Brocha angular de cerdas sintéticas para acabados en esquinas y bordes.',
                   image_url='https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop&q=80'),
            Product(name='Espátula Metálica 4"', price=7000, stock=80,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Espátula con hoja de acero flexible ideal para aplicar masilla y rascar.',
                   image_url='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80'),
            Product(name='Masilla Plástica 1kg', price=18000, stock=50,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Masilla lista para usar, ideal para nivelar paredes antes de pintar.',
                   image_url='https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80'),
            Product(name='Sellador Acrílico Transparente', price=22000, stock=35,
                   category_id=cat1_3.id, store_id=store1.id,
                   description='Sellador transparente a base de agua para grietas y juntas, exterior e interior.',
                   image_url='https://images.unsplash.com/photo-1591491719565-9a443a903d2d?w=500&auto=format&fit=crop&q=80'),
        ]
        db.session.add_all(products1)
        print(f"✓ Tienda creada: {store1.name} ({store1.slug})")

        # 3. Crear Tienda 2 - Licores
        store2 = Store(
            slug='licoreria-express',
            name='Licorería Express',
            whatsapp='+573004445566'
        )
        db.session.add(store2)
        db.session.flush()

        seller2 = User(
            email='vendedor@licoreria.com',
            password_hash='',
            role='SELLER',
            store_id=store2.id
        )
        seller2.set_password('tienda123')
        db.session.add(seller2)

        cat2_1 = Category(name='Cervezas', store_id=store2.id)
        cat2_2 = Category(name='Vinos', store_id=store2.id)
        cat2_3 = Category(name='Licores Fuertes', store_id=store2.id)
        db.session.add_all([cat2_1, cat2_2, cat2_3])
        db.session.flush()

        products2 = [
            # Cervezas
            Product(name='Cerveza Rubia 6-Pack', price=18000, promo_price=16000, stock=100,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Pack de 6 cervezas rubias nacionales bien frías.',
                   image_url='https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cerveza Artesanal IPA', price=8500, stock=60,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Cerveza artesanal tipo India Pale Ale con notas cítricas intensas.',
                   image_url='https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cerveza Negra Stout', price=9000, stock=50,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Cerveza oscura tipo Stout con notas de café y chocolate amargo.',
                   image_url='https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cerveza de Trigo Weizen', price=9500, stock=45,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Cerveza de trigo alemana con aroma afrutado y cuerpo suave.',
                   image_url='https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=500&auto=format&fit=crop&q=80'),
            Product(name='Six-Pack Mixto Artesanal', price=52000, promo_price=47000, stock=30,
                   category_id=cat2_1.id, store_id=store2.id,
                   description='Selección de 6 cervezas artesanales de diferentes estilos para explorar sabores.',
                   image_url='https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500&auto=format&fit=crop&q=80'),
            # Vinos
            Product(name='Vino Tinto Reserva', price=65000, stock=40,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Vino tinto reserva de la casa, cosecha seleccionada, notas de frutas rojas y roble.',
                   image_url='https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&auto=format&fit=crop&q=80'),
            Product(name='Vino Blanco Crianza', price=55000, stock=35,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Vino blanco afrutado ideal para acompañar pescados y mariscos.',
                   image_url='https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=500&auto=format&fit=crop&q=80'),
            Product(name='Vino Rosé Seco', price=48000, stock=30,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Vino rosado seco con notas de fresa y frambuesa, perfecto para verano.',
                   image_url='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80'),
            Product(name='Vino Espumoso Brut', price=72000, promo_price=65000, stock=20,
                   category_id=cat2_2.id, store_id=store2.id,
                   description='Vino espumoso brut con burbujas finas, ideal para celebraciones.',
                   image_url='https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=500&auto=format&fit=crop&q=80'),
            # Licores Fuertes
            Product(name='Whisky 12 Años 750ml', price=145000, promo_price=130000, stock=20,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Whisky escocés de malta mezclada, añejado durante 12 años.',
                   image_url='https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80'),
            Product(name='Tequila Reposado', price=110000, stock=25,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Tequila reposado premium 100% agave azul, reposo de 6 meses en barrica.',
                   image_url='https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=500&auto=format&fit=crop&q=80'),
            Product(name='Ginebra Premium', price=125000, stock=15,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Ginebra destilada con botánicos finos y notas de enebro y cítricos.',
                   image_url='https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=500&auto=format&fit=crop&q=80'),
            Product(name='Ron Añejo 8 Años', price=95000, stock=22,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Ron añejo caribeño de 8 años con notas de vainilla, caramelo y madera.',
                   image_url='https://images.unsplash.com/photo-1608885898957-0c5f3c5c03d3?w=500&auto=format&fit=crop&q=80'),
            Product(name='Vodka Premium 700ml', price=85000, stock=28,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Vodka premium triple destilado, suave y limpio, ideal para cócteles.',
                   image_url='https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&auto=format&fit=crop&q=80'),
            Product(name='Aguardiente Colombiano 750ml', price=38000, promo_price=34000, stock=80,
                   category_id=cat2_3.id, store_id=store2.id,
                   description='Aguardiente anisado colombiano, el sabor tradicional de las fiestas.',
                   image_url='https://images.unsplash.com/photo-1655838559840-74ef9e1618db?w=500&auto=format&fit=crop&q=80'),
        ]
        db.session.add_all(products2)
        print(f"✓ Tienda creada: {store2.name} ({store2.slug})")

        # 4. Crear Tienda 3 - Misceláneos
        store3 = Store(
            slug='mega-miscelanea',
            name='Mega Miscelánea',
            whatsapp='+573007778899'
        )
        db.session.add(store3)
        db.session.flush()

        seller3 = User(
            email='vendedor@miscelanea.com',
            password_hash='',
            role='SELLER',
            store_id=store3.id
        )
        seller3.set_password('tienda123')
        db.session.add(seller3)

        cat3_1 = Category(name='Ropa', store_id=store3.id)
        cat3_2 = Category(name='Zapatos', store_id=store3.id)
        cat3_3 = Category(name='Electrónica', store_id=store3.id)
        cat3_4 = Category(name='Comida', store_id=store3.id)
        db.session.add_all([cat3_1, cat3_2, cat3_3, cat3_4])
        db.session.flush()

        products3 = [
            # Ropa
            Product(name='Camiseta Básica', price=25000, stock=60,
                   category_id=cat3_1.id, store_id=store3.id, sizes='S,M,L,XL',
                   description='Camiseta básica cuello redondo 100% algodón, disponible en varios colores.',
                   image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80'),
            Product(name='Gorra Deportiva', price=35000, stock=40,
                   category_id=cat3_1.id, store_id=store3.id,
                   description='Gorra con visera curva ajustable, protección solar y cierre snapback.',
                   image_url='https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80'),
            Product(name='Sudadera con Capucha', price=65000, stock=35,
                   category_id=cat3_1.id, store_id=store3.id, sizes='S,M,L,XL',
                   description='Sudadera unisex con capucha y bolsillo canguro en algodón French Terry.',
                   image_url='https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop&q=80'),
            Product(name='Pantalón Jogger', price=55000, stock=45,
                   category_id=cat3_1.id, store_id=store3.id, sizes='S,M,L,XL',
                   description='Pantalón deportivo jogger con elástico en cintura y tobillos, muy cómodo.',
                   image_url='https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80'),
            Product(name='Calcetines Deportivos x3 Pares', price=18000, stock=100,
                   category_id=cat3_1.id, store_id=store3.id,
                   description='Pack de 3 pares de calcetines deportivos con protección en tobillo, talla única.',
                   image_url='https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=80'),
            # Zapatos
            Product(name='Zapatos Casuales', price=85000, stock=30,
                   category_id=cat3_2.id, store_id=store3.id, sizes='38,39,40,41,42,43',
                   description='Zapatos cómodos de diseño urbano en lona y cuero sintético, suela ligera.',
                   image_url='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'),
            Product(name='Tenis Running Unisex', price=120000, promo_price=99000, stock=25,
                   category_id=cat3_2.id, store_id=store3.id, sizes='37,38,39,40,41,42,43',
                   description='Tenis de running con amortiguación en talón y suela antideslizante.',
                   image_url='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop&q=80'),
            Product(name='Sandalias de Playa', price=40000, stock=50,
                   category_id=cat3_2.id, store_id=store3.id, sizes='36,37,38,39,40,41',
                   description='Sandalias ligeras con plantilla acolchada y correa ajustable.',
                   image_url='https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&auto=format&fit=crop&q=80'),
            # Electrónica
            Product(name='Audífonos Inalámbricos', price=45000, stock=40,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Audífonos Bluetooth in-ear con estuche de carga rápida y hasta 24h de batería.',
                   image_url='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80'),
            Product(name='Reloj Inteligente Básico', price=60000, stock=25,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Smartwatch deportivo con monitor de ritmo cardíaco, pasos y notificaciones.',
                   image_url='https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cargador de Carga Rápida 20W', price=25000, stock=50,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Adaptador de pared USB-C de 20W con certificación para smartphones.',
                   image_url='https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80'),
            Product(name='Power Bank 10000mAh', price=55000, promo_price=48000, stock=35,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Batería portátil de 10000mAh con 2 puertos USB y carga rápida integrada.',
                   image_url='https://images.unsplash.com/photo-1609592806596-b9e3a5b3e0c5?w=500&auto=format&fit=crop&q=80'),
            Product(name='Cable USB-C a USB-C 1m', price=15000, stock=80,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Cable trenzado USB-C de 1 metro, compatible con carga rápida hasta 60W.',
                   image_url='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80'),
            Product(name='Parlante Bluetooth Portátil', price=75000, stock=20,
                   category_id=cat3_3.id, store_id=store3.id,
                   description='Parlante inalámbrico compacto resistente al agua IPX5 con 10h de batería.',
                   image_url='https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80'),
            # Comida
            Product(name='Paquete Snacks Surtidos', price=15000, stock=100,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Mix familiar de papas fritas, nachos y aperitivos salados.',
                   image_url='https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop&q=80'),
            Product(name='Caja de Chocolates', price=35000, stock=45,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Caja de bombones rellenos surtidos de chocolate fino belga.',
                   image_url='https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80'),
            Product(name='Maní con Sal x250g', price=8000, stock=150,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Maní tostado con sal marina, ideal como snack saludable y energético.',
                   image_url='https://images.unsplash.com/photo-1567892737950-30c4db37b9aa?w=500&auto=format&fit=crop&q=80'),
            Product(name='Galletas Integrales x200g', price=7500, stock=120,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Galletas integrales con semillas de chía y avena, bajo en azúcar.',
                   image_url='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80'),
            Product(name='Café Molido Premium 250g', price=28000, stock=60,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Café de origen colombiano, tostión media, molido para cafetera de goteo.',
                   image_url='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80'),
            Product(name='Avena Instantánea x500g', price=12000, stock=90,
                   category_id=cat3_4.id, store_id=store3.id,
                   description='Avena instantánea en hojuelas, sin azúcar añadida, rica en fibra y proteína.',
                   image_url='https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format&fit=crop&q=80'),
        ]
        db.session.add_all(products3)
        print(f"✓ Tienda creada: {store3.name} ({store3.slug})")

        db.session.commit()
        print("\n✅ Nuevos datos de prueba creados exitosamente!")
        print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Credenciales de prueba:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Super Admin:")
        print("  Email: admin@eshop.com")
        print("  Pass:  admin123")
        print()
        print("Vendedores:")
        print("  Ferretería:  vendedor@ferreteria.com  / tienda123")
        print("  Licores:     vendedor@licoreria.com   / tienda123")
        print("  Miscelánea:  vendedor@miscelanea.com  / tienda123")
        print()
        print("Catálogos públicos:")
        print("  http://localhost:5173/ferreteria-master")
        print("  http://localhost:5173/licoreria-express")
        print("  http://localhost:5173/mega-miscelanea")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    seed()