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
        """Create a new order starting as PENDIENTE"""
        order = Order(
            store_id=store_id,
            customer_name=data['customer_name'],
            customer_phone=data.get('customer_phone'),
            total_price=data['total_price'],
            status='PENDIENTE'
        )
        
        db.session.add(order)
        db.session.flush() # Populate order.id
        
        for item_data in data['items']:
            item = OrderItem(
                order_id=order.id,
                product_id=item_data.get('product_id'),
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
        # 1. Transition TO 'ENTREGADO' (decrease stock)
        if new_status == 'ENTREGADO' and old_status != 'ENTREGADO':
            OrderService._adjust_stock(order, decrease=True)
            
        # 2. Transition FROM 'ENTREGADO' to other state (increase/restore stock)
        elif old_status == 'ENTREGADO' and new_status != 'ENTREGADO':
            OrderService._adjust_stock(order, decrease=False)
            
        order.status = new_status
        db.session.commit()
        return order_schema.dump(order)

    @staticmethod
    def _adjust_stock(order, decrease=True):
        """Adjust product stock based on order item quantities and sizes"""
        for item in order.items:
            if not item.product_id:
                continue
                
            product = Product.query.get(item.product_id)
            if not product:
                continue
                
            qty_change = item.quantity if decrease else -item.quantity
            
            # If product has sizes
            if product.sizes and product.sizes.startswith('{'):
                try:
                    sizes_map = json.loads(product.sizes)
                    size = item.selected_size
                    if size and size in sizes_map:
                        # Decrease or increase size stock, ensuring it doesn't go below 0
                        sizes_map[size] = max(0, sizes_map[size] - qty_change)
                        product.sizes = json.dumps(sizes_map)
                        # Recalculate total product stock as sum of all sizes
                        product.stock = sum(sizes_map.values())
                    else:
                        product.stock = max(0, product.stock - qty_change)
                except Exception:
                    product.stock = max(0, product.stock - qty_change)
            else:
                product.stock = max(0, product.stock - qty_change)
