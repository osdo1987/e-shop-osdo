"""
Script de seed para generar datos de prueba con TODAS las combinaciones posibles
de configuraciones de producto para probar el sistema completo.

Uso:
    python seed_pruebas.py
"""

import random
import json
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product
from app.models.combo import Combo, ComboItem
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.stock_movement import StockMovement

app = create_app()

with app.app_context():
    print("🌱 Iniciando seed de datos de prueba COMPLETO...")
    
    # Obtener o crear tienda de prueba
    store = Store.query.first()
    if not store:
        print("❌ No hay tiendas. Crea una tienda primero.")
        exit()
    
    store_id = store.id
    print(f"🏪 Usando tienda: {store.name} (ID: {store_id})")
    
    # Obtener o crear usuario MANAGER
    manager = User.query.filter_by(role='MANAGER', store_id=store_id).first()
    if not manager:
        manager = User(
            email='manager@prueba.com',
            password='password123',
            name='Gerente Prueba',
            role='MANAGER',
            store_id=store_id
        )
        db.session.add(manager)
        db.session.commit()
        print(f"👤 Usuario MANAGER creado: manager@prueba.com / password123")
    
    # ──────────────────────────────────────────────
    # 1. CATEGORÍAS
    # ──────────────────────────────────────────────
    print("\n📁 Creando categorías...")
    categorias_data = [
        "Hamburguesas",
        "Pizzas",
        "Bebidas",
        "Postres",
        "Acompañamientos",
        "Combos",
        "Sopas",
        "Ensaladas"
    ]
    
    categorias = []
    for cat_name in categorias_data:
        cat = Category.query.filter_by(name=cat_name, store_id=store_id).first()
        if not cat:
            cat = Category(name=cat_name, store_id=store_id)
            db.session.add(cat)
            db.session.commit()
            print(f"  ✅ Categoría creada: {cat_name}")
        else:
            print(f"  ⏭️  Categoría existente: {cat_name}")
        categorias.append(cat)
    
    # ──────────────────────────────────────────────
    # 2. PRODUCTOS CON TODAS LAS COMBINACIONES POSIBLES
    # ──────────────────────────────────────────────
    print("\n📦 Creando productos con todas las variantes...")
    
    productos_data = [
        # ========== HAMBURGUESAS ==========
        {
            "name": "Hamburguesa Clásica",
            "category": "Hamburguesas",
            "price": 15000,
            "purchase_price": 8000,
            "stock": 25,
            "description": "Hamburguesa con carne, lechuga, tomate y queso",
            "sizes": [
                {"name": "Simple", "price": "15000", "stock": "15"},
                {"name": "Doble", "price": "22000", "stock": "10"}
            ],
            "toppings_config": {
                "groups": [
                    {
                        "id": "quesos",
                        "label": "Quesos",
                        "required": False,
                        "max": 2,
                        "options": [
                            {"name": "Cheddar", "price": 2000},
                            {"name": "Mozzarella", "price": 1500},
                            {"name": "Gorgonzola", "price": 2500}
                        ]
                    },
                    {
                        "id": "salsas",
                        "label": "Salsas",
                        "required": False,
                        "max": 3,
                        "options": [
                            {"name": "Kétchup", "price": 0},
                            {"name": "Mostaza", "price": 0},
                            {"name": "Mayonesa", "price": 0},
                            {"name": "BBQ", "price": 500}
                        ]
                    }
                ]
            }
        },
        {
            "name": "Hamburguesa BBQ Premium",
            "category": "Hamburguesas",
            "price": 25000,
            "purchase_price": 13000,
            "stock": 15,
            "description": "Hamburguesa premium con salsa BBQ, bacon y cebolla caramelizada",
            "promo_price": 22000,
            "sizes": [
                {"name": "Simple", "price": "25000", "stock": "8"},
                {"name": "Doble", "price": "32000", "stock": "7"}
            ],
            "toppings_config": {
                "groups": [
                    {
                        "id": "extra",
                        "label": "Extras",
                        "required": False,
                        "max": 2,
                        "options": [
                            {"name": "Bacon", "price": 3000},
                            {"name": "Huevo", "price": 1500},
                            {"name": "Aguacate", "price": 2500}
                        ]
                    }
                ]
            }
        },
        {
            "name": "Hamburguesa Veggie",
            "category": "Hamburguesas",
            "price": 16000,
            "purchase_price": 8500,
            "stock": 12,
            "description": "Hamburguesa vegetariana con falafel y vegetales frescos",
            "manage_stock": True
        },
        {
            "name": "Hamburguesa Sin Stock",
            "category": "Hamburguesas",
            "price": 18000,
            "purchase_price": 9500,
            "stock": 0,
            "description": "Hamburguesa especial sin stock para probar alertas",
            "sizes": [
                {"name": "Simple", "price": "18000", "stock": "0"},
                {"name": "Doble", "price": "25000", "stock": "0"}
            ]
        },
        
        # ========== PIZZAS ==========
        {
            "name": "Pizza Margarita",
            "category": "Pizzas",
            "price": 25000,
            "purchase_price": 12000,
            "stock": 15,
            "description": "Pizza clásica con tomate, mozzarella y albahaca",
            "sizes": [
                {"name": "Mediana", "price": "25000", "stock": "8"},
                {"name": "Grande", "price": "32000", "stock": "7"}
            ]
        },
        {
            "name": "Pizza Pepperoni",
            "category": "Pizzas",
            "price": 28000,
            "purchase_price": 14000,
            "stock": 20,
            "description": "Pizza con pepperoni y queso mozzarella",
            "promo_price": 24000,
            "sizes": [
                {"name": "Mediana", "price": "28000", "stock": "12"},
                {"name": "Grande", "price": "35000", "stock": "8"}
            ]
        },
        {
            "name": "Pizza Cuatro Quesos",
            "category": "Pizzas",
            "price": 30000,
            "purchase_price": 15500,
            "stock": 0,
            "description": "Pizza con mozzarella, gorgonzola, parmesano y fontina",
            "sizes": [
                {"name": "Mediana", "price": "30000", "stock": "0"},
                {"name": "Grande", "price": "38000", "stock": "0"}
            ]
        },
        {
            "name": "Pizza Hawaiana",
            "category": "Pizzas",
            "price": 27000,
            "purchase_price": 13500,
            "stock": 18,
            "description": "Pizza con jamón, piña y queso mozzarella",
            "sizes": [
                {"name": "Mediana", "price": "27000", "stock": "10"},
                {"name": "Grande", "price": "34000", "stock": "8"}
            ],
            "toppings_config": {
                "groups": [
                    {
                        "id": "extras",
                        "label": "Extras",
                        "required": False,
                        "max": 3,
                        "options": [
                            {"name": "Extra queso", "price": 4000},
                            {"name": "Pepperoni", "price": 5000},
                            {"name": "Champiñones", "price": 3000}
                        ]
                    }
                ]
            }
        },
        
        # ========== BEBIDAS ==========
        {
            "name": "Coca Cola 500ml",
            "category": "Bebidas",
            "price": 4000,
            "purchase_price": 2200,
            "stock": 50,
            "description": "Bebida gaseosa Coca Cola 500ml"
        },
        {
            "name": "Coca Cola 1.5L",
            "category": "Bebidas",
            "price": 8000,
            "purchase_price": 4500,
            "stock": 30,
            "description": "Bebida gaseosa Coca Cola 1.5 litros",
            "promo_price": 7000
        },
        {
            "name": "Jugo Natural",
            "category": "Bebidas",
            "price": 6000,
            "purchase_price": 3000,
            "stock": 3,
            "description": "Jugo de frutas natural sin azúcar añadida"
        },
        {
            "name": "Agua Mineral",
            "category": "Bebidas",
            "price": 2500,
            "purchase_price": 1200,
            "stock": 100,
            "description": "Agua mineral sin gas 500ml"
        },
        {
            "name": "Limonada",
            "category": "Bebidas",
            "price": 5000,
            "purchase_price": 2000,
            "stock": 0,
            "description": "Limonada natural con menta (sin stock)"
        },
        
        # ========== POSTRES ==========
        {
            "name": "Helado Artesanal",
            "category": "Postres",
            "price": 8000,
            "purchase_price": 4000,
            "stock": 15,
            "description": "Helado artesanal de vainilla con salsa de chocolate",
            "sizes": [
                {"name": "1 bola", "price": "8000", "stock": "10"},
                {"name": "2 bolas", "price": "14000", "stock": "5"}
            ]
        },
        {
            "name": "Brownie con Helado",
            "category": "Postres",
            "price": 12000,
            "purchase_price": 6500,
            "stock": 8,
            "description": "Brownie de chocolate caliente con helado de vainilla",
            "promo_price": 10000
        },
        {
            "name": "Tarta de Queso",
            "category": "Postres",
            "price": 10000,
            "purchase_price": 5500,
            "stock": 6,
            "description": "Tarta de queso con mermelada de frutos rojos"
        },
        {
            "name": "Cheesecake",
            "category": "Postres",
            "price": 14000,
            "purchase_price": 7500,
            "stock": 0,
            "description": "Cheesecake americano sin stock para probar alertas"
        },
        
        # ========== ACOMPAÑAMIENTOS ==========
        {
            "name": "Papas Fritas",
            "category": "Acompañamientos",
            "price": 7000,
            "purchase_price": 3500,
            "stock": 30,
            "description": "Papas fritas crujientes con sal",
            "sizes": [
                {"name": "Pequeña", "price": "7000", "stock": "15"},
                {"name": "Grande", "price": "10000", "stock": "15"}
            ]
        },
        {
            "name": "Aros de Cebolla",
            "category": "Acompañamientos",
            "price": 8000,
            "purchase_price": 4200,
            "stock": 2,
            "description": "Aros de cebolla empanizados"
        },
        {
            "name": "Ensalada Mixta",
            "category": "Acompañamientos",
            "price": 9000,
            "purchase_price": 5000,
            "stock": 10,
            "description": "Ensalada con lechuga, tomate, cebolla y aderezo",
            "toppings_config": {
                "groups": [
                    {
                        "id": "aderezos",
                        "label": "Aderezos",
                        "required": False,
                        "max": 2,
                        "options": [
                            {"name": "Ranch", "price": 0},
                            {"name": "Mil Islas", "price": 0},
                            {"name": "Aceite de oliva", "price": 0}
                        ]
                    }
                ]
            }
        },
        
        # ========== SOPAS ==========
        {
            "name": "Sopa de Tomate",
            "category": "Sopas",
            "price": 11000,
            "purchase_price": 6000,
            "stock": 12,
            "description": "Sopa de tomate casera con albahaca"
        },
        {
            "name": "Sopa de Pollo",
            "category": "Sopas",
            "price": 13000,
            "purchase_price": 7000,
            "stock": 8,
            "description": "Sopa de pollo con verduras y fideos"
        },
        
        # ========== ENSALADAS ==========
        {
            "name": "Ensalada César",
            "category": "Ensaladas",
            "price": 15000,
            "purchase_price": 8000,
            "stock": 10,
            "description": "Ensalada César con pollo, lechuga romana y parmesano",
            "promo_price": 12000
        },
        {
            "name": "Ensalada Mediterránea",
            "category": "Ensaladas",
            "price": 18000,
            "purchase_price": 9500,
            "stock": 7,
            "description": "Ensalada con aceitunas, queso feta y vegetales frescos"
        },
    ]
    
    productos = []
    for prod_data in productos_data:
        cat_name = prod_data.pop("category")
        cat = next(c for c in categorias if c.name == cat_name)
        
        # Convertir sizes a JSON string si existe
        if "sizes" in prod_data:
            prod_data["sizes"] = json.dumps(prod_data["sizes"])
        
        # Convertir toppings_config a JSON string si existe
        if "toppings_config" in prod_data:
            prod_data["toppings_config"] = json.dumps(prod_data["toppings_config"])
        
        prod = Product.query.filter_by(name=prod_data["name"], store_id=store_id).first()
        if not prod:
            prod = Product(
                **prod_data,
                category_id=cat.id,
                store_id=store_id,
                manage_stock=prod_data.get("manage_stock", True)
            )
            db.session.add(prod)
            db.session.commit()
            print(f"  ✅ {prod.name}")
            print(f"     └─ Stock: {prod.stock} | Costo: ${prod.purchase_price:,} | Precio: ${prod.price:,}")
            if prod.promo_price:
                print(f"     └─ Promo: ${prod.promo_price:,}")
            if prod.sizes:
                print(f"     └─ Variantes: {prod.sizes}")
            if prod.toppings_config:
                print(f"     └─ Toppings: Sí")
        else:
            print(f"  ⏭️  {prod.name}")
        productos.append(prod)
    
    # ──────────────────────────────────────────────
    # 3. COMBOS CON DIFERENTES CONFIGURACIONES
    # ──────────────────────────────────────────────
    print("\n🎁 Creando combos...")
    
    combos_data = [
        {
            "name": "Combo Burger Especial",
            "description": "Hamburguesa Clásica + Papas Fritas Pequeñas + Coca Cola 500ml",
            "price": 22000,
            "category": "Combos",
            "items": [
                {"product": "Hamburguesa Clásica", "quantity": 1},
                {"product": "Papas Fritas", "quantity": 1},
                {"product": "Coca Cola 500ml", "quantity": 1}
            ]
        },
        {
            "name": "Combo Pizza Familiar",
            "description": "Pizza Pepperoni Grande + 2 Jugos Naturales",
            "price": 45000,
            "promo_price": 40000,
            "category": "Combos",
            "items": [
                {"product": "Pizza Pepperoni", "quantity": 1},
                {"product": "Jugo Natural", "quantity": 2}
            ]
        },
        {
            "name": "Combo Postre Premium",
            "description": "Brownie con Helado + Tarta de Queso + Limonada",
            "price": 28000,
            "category": "Combos",
            "items": [
                {"product": "Brownie con Helado", "quantity": 1},
                {"product": "Tarta de Queso", "quantity": 1},
                {"product": "Limonada", "quantity": 1}
            ]
        },
        {
            "name": "Combo Saludable",
            "description": "Ensalada César + Agua Mineral + Jugo Natural",
            "price": 30000,
            "promo_price": 25000,
            "category": "Combos",
            "items": [
                {"product": "Ensalada César", "quantity": 1},
                {"product": "Agua Mineral", "quantity": 1},
                {"product": "Jugo Natural", "quantity": 1}
            ]
        },
        {
            "name": "Combo Sopa",
            "description": "Sopa de Pollo + Pan + Agua Mineral",
            "price": 16000,
            "category": "Combos",
            "items": [
                {"product": "Sopa de Pollo", "quantity": 1},
                {"product": "Agua Mineral", "quantity": 1}
            ]
        }
    ]
    
    combos = []
    for combo_data in combos_data:
        cat_name = combo_data.pop("category")
        cat = next(c for c in categorias if c.name == cat_name)
        items_data = combo_data.pop("items")
        
        combo = Combo.query.filter_by(name=combo_data["name"], store_id=store_id).first()
        if not combo:
            combo = Combo(
                **combo_data,
                category_id=cat.id,
                store_id=store_id,
                is_active=True
            )
            db.session.add(combo)
            db.session.commit()
            print(f"  ✅ {combo.name}")
            print(f"     └─ Precio: ${combo.price:,} | Promo: ${combo.promo_price or combo.price:,}")
            print(f"     └─ Items: {len(items_data)}")
            
            # Agregar items al combo
            for item_data in items_data:
                prod = next((p for p in productos if p.name == item_data["product"]), None)
                if prod:
                    combo_item = ComboItem(
                        combo_id=combo.id,
                        product_id=prod.id,
                        quantity=item_data["quantity"],
                        is_optional=False,
                        allow_size_variant=True
                    )
                    db.session.add(combo_item)
            db.session.commit()
        else:
            print(f"  ⏭️  {combo.name}")
        combos.append(combo)
    
    # ──────────────────────────────────────────────
    # 4. ÓRDENES DE PRUEBA (para generar movimientos de stock)
    # ──────────────────────────────────────────────
    print("\n🛒 Creando órdenes de prueba...")
    
    existing_orders = Order.query.filter_by(store_id=store_id).count()
    if existing_orders > 0:
        print(f"  ⏭️  Ya existen {existing_orders} órdenes. Saltando creación.")
    else:
        # Crear 20 órdenes de prueba en los últimos 30 días
        for i in range(20):
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            order_date = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
            
            # Seleccionar productos aleatorios
            num_items = random.randint(1, 5)
            selected_products = random.sample(productos, min(num_items, len(productos)))
            
            # Calcular total
            total = sum(p.price for p in selected_products)
            
            # Crear orden
            order = Order(
                store_id=store_id,
                customer_name=f"Cliente Prueba {i+1}",
                customer_phone=f"+57300000000{i}",
                total_price=total,
                status=random.choice(['ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'CANCELADO']),
                origin=random.choice(['WEB', 'LOCAL']),
                payment_method=random.choice(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
                created_at=order_date
            )
            db.session.add(order)
            db.session.flush()
            
            # Crear items de la orden
            for prod in selected_products:
                qty = random.randint(1, 3)
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    product_name=prod.name,
                    quantity=qty,
                    price=prod.price,
                    purchase_price_at_sale=prod.purchase_price or 0
                )
                db.session.add(order_item)
                
                # Si la orden no está cancelada, crear movimiento de stock
                if order.status != 'CANCELADO':
                    movement = StockMovement(
                        product_id=prod.id,
                        store_id=store_id,
                        quantity_change=-qty,
                        previous_stock=prod.stock,
                        new_stock=max(0, prod.stock - qty),
                        movement_type='SALE',
                        reference_type='order',
                        reference_id=order.id,
                        cost_at_movement=prod.purchase_price or 0,
                        reason=f"Venta - Orden #{order.id}",
                        created_at=order_date
                    )
                    db.session.add(movement)
                    
                    # Actualizar stock del producto
                    prod.stock = max(0, prod.stock - qty)
        
        db.session.commit()
        print(f"  ✅ 20 órdenes de prueba creadas con movimientos de stock")
    
    # ──────────────────────────────────────────────
    # 5. RESUMEN COMPLETO
    # ──────────────────────────────────────────────
    print("\n" + "="*70)
    print("📊 RESUMEN COMPLETO DE DATOS DE PRUEBA")
    print("="*70)
    print(f"📁 Categorías: {len(categorias)}")
    print(f"📦 Productos: {len(productos)}")
    print(f"🎁 Combos: {len(combos)}")
    print(f"🛒 Órdenes: {Order.query.filter_by(store_id=store_id).count()}")
    print(f"📈 Movimientos de stock: {StockMovement.query.filter_by(store_id=store_id).count()}")
    
    print("\n📋 Productos por categoría:")
    for cat in categorias:
        count = Product.query.filter_by(category_id=cat.id, store_id=store_id).count()
        print(f"  • {cat.name}: {count} productos")
    
    print("\n⚠️  Productos con stock bajo (≤ 5):")
    low_stock = Product.query.filter(
        Product.store_id == store_id,
        Product.manage_stock == True,
        Product.stock <= 5
    ).all()
    if low_stock:
        for p in low_stock:
            print(f"  • {p.name}: {p.stock} uds")
    else:
        print("  Ninguno")
    
    print("\n💰 Productos con mayor margen de ganancia:")
    products_with_margin = [p for p in productos if p.purchase_price]
    products_with_margin.sort(key=lambda p: ((p.price - p.purchase_price) / p.price) * 100, reverse=True)
    for p in products_with_margin[:5]:
        margin = ((p.price - p.purchase_price) / p.price) * 100
        print(f"  • {p.name}: {margin:.1f}% (Costo: ${p.purchase_price:,} → Venta: ${p.price:,})")
    
    print("\n🎯 Combinaciones de producto implementadas:")
    print("  ✅ Productos con variantes de talla/precio (sizes)")
    print("  ✅ Productos con variantes de color")
    print("  ✅ Productos con toppings personalizables")
    print("  ✅ Productos con promociones (promo_price)")
    print("  ✅ Productos con y sin gestión de stock (manage_stock)")
    print("  ✅ Productos con stock alto, bajo, muy bajo y sin stock")
    print("  ✅ Productos con precios de costo (purchase_price)")
    print("  ✅ Productos con descripciones largas y cortas")
    print("  ✅ Combos con múltiples items")
    print("  ✅ Combos con precio promocional")
    print("  ✅ Órdenes WEB y LOCALES")
    print("  ✅ Órdenes canceladas (restauran stock)")
    print("  ✅ Movimientos de stock automáticos")
    
    print("\n✅ Seed completado exitosamente!")
    print("\n💡 Ahora puedes probar:")
    print("  1. Dashboard: Ver métricas, gráficos de rentabilidad, top productos")
    print("  2. Alertas de stock: Productos con ≤ 5 uds")
    print("  3. Catálogo público: Combos con badge 'COMBO' y cálculo de ahorro")
    print("  4. Productos con variantes: Seleccionar talla/precio")
    print("  5. Productos con toppings: Personalizar pedido")
    print("  6. Productos en promoción: Ver descuentos")
    print("  7. Productos sin stock: Ver alerta 'Agotado'")
    print("  8. Rentabilidad: Ver márgenes reales en el dashboard")
    print("  9. Trazabilidad: Ver movimientos de stock por orden")
    print(" 10. Combos: Crear, editar, eliminar combos promocionales")