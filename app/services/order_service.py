import json
import secrets
from datetime import datetime
from app.extensions import db
from app.models.order import Order, OrderItem, OrderStatusHistory, STATUS_TRANSITIONS
from app.models.product import Product
from app.schemas.order_schema import OrderSchema
from sqlalchemy.orm import joinedload

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
        tracking_token = secrets.token_urlsafe(48)
        
        order = Order(
            store_id=store_id,
            customer_name=data['customer_name'],
            customer_phone=data.get('customer_phone'),
            total_price=data['total_price'],
            status='PENDIENTE',
            delivery_address=data.get('delivery_address'),
            customer_notes=data.get('customer_notes'),
            tracking_token=tracking_token
        )
        
        db.session.add(order)
        db.session.flush() # Populate order.id
        
        # Create initial status history entry
        history_entry = OrderStatusHistory(
            order_id=order.id,
            old_status=None,
            new_status='PENDIENTE',
            changed_by='Sistema',
            notes='Pedido creado'
        )
        db.session.add(history_entry)
        
        # Loop through items and validate/adjust stock inside the transaction
        for item_data in data['items']:
            product_id = item_data.get('product_id')
            if product_id:
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
    def update_order_status(order_id, new_status, changed_by='Vendedor', notes=None):
        """Update order status with transition validation and history tracking"""
        order = Order.query.get(order_id)
        if not order:
            return None, 'Pedido no encontrado'
            
        old_status = order.status
        if old_status == new_status:
            return order_schema.dump(order), None
        
        # Validate transition
        allowed = STATUS_TRANSITIONS.get(old_status, [])
        if new_status not in allowed:
            return None, f'No se puede cambiar de {old_status} a {new_status}'
            
        # Handle stock modifications
        if old_status != 'CANCELADO' and new_status == 'CANCELADO':
            # Any active status to CANCELADO -> Restore stock
            for item in order.items:
                if item.product_id:
                    OrderService._validate_and_adjust_stock(
                        product_id=item.product_id,
                        quantity=item.quantity,
                        size=item.selected_size,
                        decrease=False
                    )
        elif old_status == 'CANCELADO' and new_status != 'CANCELADO':
            # CANCELADO to any active -> Deduct stock
            for item in order.items:
                if item.product_id:
                    OrderService._validate_and_adjust_stock(
                        product_id=item.product_id,
                        quantity=item.quantity,
                        size=item.selected_size,
                        decrease=True
                    )
            
        order.status = new_status
        
        # Record history
        history_entry = OrderStatusHistory(
            order_id=order.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            notes=notes
        )
        db.session.add(history_entry)
        db.session.commit()
        return order_schema.dump(order), None

    @staticmethod
    def update_seller_notes(order_id, notes):
        """Update seller notes for an order"""
        order = Order.query.get(order_id)
        if not order:
            return None, 'Pedido no encontrado'
        
        order.seller_notes = notes
        db.session.commit()
        return order_schema.dump(order), None

    @staticmethod
    def update_estimated_delivery(order_id, estimated_delivery):
        """Update estimated delivery time"""
        order = Order.query.get(order_id)
        if not order:
            return None, 'Pedido no encontrado'
        
        order.estimated_delivery = estimated_delivery
        db.session.commit()
        return order_schema.dump(order), None

    @staticmethod
    def get_order_by_token(tracking_token):
        """Get order by tracking token (public access)"""
        order = Order.query.options(
            joinedload(Order.store)
        ).filter_by(tracking_token=tracking_token).first()
        if not order:
            return None
        return order_schema.dump(order)

    @staticmethod
    def get_order_history(order_id):
        """Get status history for an order"""
        history = OrderStatusHistory.query.filter_by(order_id=order_id)\
            .order_by(OrderStatusHistory.created_at.asc()).all()
        return [{
            'id': h.id,
            'old_status': h.old_status,
            'new_status': h.new_status,
            'changed_by': h.changed_by,
            'notes': h.notes,
            'created_at': h.created_at.isoformat() if h.created_at else None
        } for h in history]

    @staticmethod
    def _validate_and_adjust_stock(product_id, quantity, size=None, decrease=True):
        """
        Locks the product row using with_for_update, validates stock availability if decreasing,
        and adjusts the stock global and size values.
        Raises ValueError if stock is insufficient.
        """
        product = Product.query.with_for_update().get(product_id)
        if not product:
            raise ValueError(f"El producto con ID {product_id} no existe.")

        qty_change = quantity if decrease else -quantity

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
                    if decrease and product.stock < quantity:
                        raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
                    product.stock = max(0, product.stock - qty_change)
            except ValueError as ve:
                raise ve
            except Exception:
                if decrease and product.stock < quantity:
                    raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
                product.stock = max(0, product.stock - qty_change)
        else:
            if decrease and product.stock < quantity:
                raise ValueError(f"Stock insuficiente para {product.name}. Disponibles: {product.stock}.")
            product.stock = max(0, product.stock - qty_change)