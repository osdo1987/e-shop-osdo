import json
from app.extensions import db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order_schema import OrderSchema

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

class OrderService:
    @staticmethod
    def get_orders_by_store(store_id):
        """Get all orders for a store, sorted by newest first"""
        orders = Order.query.filter_by(store_id=store_id).order_by(Order.created_at.desc()).all()
        return orders_schema.dump(orders)

    @staticmethod
    def create_order(store_id, data):
        """Create a new order starting as PENDIENTE, reserving stock immediately"""
        order = Order(
            store_id=store_id,
            customer_name=data['customer_name'],
            customer_phone=data.get('customer_phone'),
            total_price=data['total_price'],
            status='PENDIENTE'
        )
        
        db.session.add(order)
        db.session.flush() # Populate order.id
        
        # Loop through items and validate/adjust stock inside the transaction
        for item_data in data['items']:
            product_id = item_data.get('product_id')
            if product_id:
                # This locks the product row and validates stock availability
                OrderService._validate_and_adjust_stock(
                    product_id=product_id,
                    quantity=item_data['quantity'],
                    size=item_data.get('selected_size'),
                    decrease=True
                )
                
            item = OrderItem(
                order_id=order.id,
                product_id=product_id,
                product_name=item_data['product_name'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                selected_size=item_data.get('selected_size')
            )
            db.session.add(item)
            
        db.session.commit()
        return order_schema.dump(order)

    @staticmethod
    def update_order_status(order_id, new_status):
        """Update order status and handle automatic stock modifications"""
        order = Order.query.get(order_id)
        if not order:
            return None
            
        old_status = order.status
        if old_status == new_status:
            return order_schema.dump(order)
            
        # Check transition and update stock
        # 1. From active (PENDIENTE/ENTREGADO) to CANCELADO -> Restore stock (increase)
        if old_status in ['PENDIENTE', 'ENTREGADO'] and new_status == 'CANCELADO':
            for item in order.items:
                if item.product_id:
                    OrderService._validate_and_adjust_stock(
                        product_id=item.product_id,
                        quantity=item.quantity,
                        size=item.selected_size,
                        decrease=False
                    )
                    
        # 2. From CANCELADO to active (PENDIENTE/ENTREGADO) -> Deduct stock (decrease)
        elif old_status == 'CANCELADO' and new_status in ['PENDIENTE', 'ENTREGADO']:
            for item in order.items:
                if item.product_id:
                    OrderService._validate_and_adjust_stock(
                        product_id=item.product_id,
                        quantity=item.quantity,
                        size=item.selected_size,
                        decrease=True
                    )
            
        order.status = new_status
        db.session.commit()
        return order_schema.dump(order)

    @staticmethod
    def _validate_and_adjust_stock(product_id, quantity, size=None, decrease=True):
        """
        Locks the product row using with_for_update, validates stock availability if decreasing,
        and adjusts the stock global and size values.
        Raises ValueError if stock is insufficient.
        """
        # Lock row using pessimistic lock (concurrency-safe)
        product = Product.query.with_for_update().get(product_id)
        if not product:
            raise ValueError(f"El producto con ID {product_id} no existe.")

        qty_change = quantity if decrease else -quantity

        # If product has sizes mapping
        if product.sizes and product.sizes.startswith('{'):
            try:
                sizes_map = json.loads(product.sizes)
                if size:
                    if size not in sizes_map:
                        raise ValueError(f"La talla '{size}' no existe para el producto '{product.name}'.")
                    
                    if decrease and sizes_map[size] < quantity:
                        raise ValueError(f"Stock insuficiente para {product.name} (Talla {size}). Disponibles: {sizes_map[size]}.")
                    
                    sizes_map[size] = max(0, sizes_map[size] - qty_change)
                    product.sizes = json.dumps(sizes_map)
                    product.stock = sum(sizes_map.values())
                else:
                    # Fallback if size not specified
                    if decrease and product.stock < quantity:
                        raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
                    product.stock = max(0, product.stock - qty_change)
            except ValueError as ve:
                raise ve
            except Exception:
                # Fallback if json parsing fails
                if decrease and product.stock < quantity:
                    raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
                product.stock = max(0, product.stock - qty_change)
        else:
            if decrease and product.stock < quantity:
                raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
            product.stock = max(0, product.stock - qty_change)
