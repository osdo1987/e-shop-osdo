import json
from app.extensions import db
from app.models.combo import Combo, ComboItem
from app.models.product import Product
from app.schemas.combo_schema import ComboSchema

combo_schema = ComboSchema()
combos_schema = ComboSchema(many=True)


class ComboService:
    @staticmethod
    def get_combos_by_store(store_id, category_id=None, only_active=True):
        query = Combo.query.filter_by(store_id=store_id)
        if only_active:
            query = query.filter_by(is_active=True)
        if category_id:
            query = query.filter_by(category_id=category_id)
        combos = query.all()
        return combos_schema.dump(combos)

    @staticmethod
    def get_combo_by_id(combo_id):
        combo = Combo.query.get(combo_id)
        if combo:
            return combo_schema.dump(combo)
        return None

    @staticmethod
    def create_combo(store_id, data):
        try:
            items_data = data.pop('items', [])
            combo = Combo(
                name=data['name'],
                description=data.get('description'),
                price=data['price'],
                promo_price=data.get('promo_price'),
                image_id=data.get('image_id'),
                image_url=data.get('image_url'),
                category_id=data['category_id'],
                store_id=store_id,
                is_active=data.get('is_active', True),
                max_per_order=data.get('max_per_order', 0)
            )
            db.session.add(combo)
            db.session.flush()

            for item_data in items_data:
                product = Product.query.get(item_data['product_id'])
                if not product:
                    raise ValueError(f"Producto con ID {item_data['product_id']} no encontrado")
                combo_item = ComboItem(
                    combo_id=combo.id,
                    product_id=item_data['product_id'],
                    quantity=item_data.get('quantity', 1),
                    is_optional=item_data.get('is_optional', False),
                    allow_size_variant=item_data.get('allow_size_variant', True)
                )
                db.session.add(combo_item)

            db.session.commit()
            return combo_schema.dump(combo)
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def update_combo(combo_id, data):
        try:
            combo = Combo.query.get(combo_id)
            if not combo:
                return None

            items_data = data.pop('items', None)

            if 'name' in data:
                combo.name = data['name']
            if 'description' in data:
                combo.description = data['description']
            if 'price' in data:
                combo.price = data['price']
            if 'promo_price' in data:
                combo.promo_price = data['promo_price']
            if 'image_id' in data:
                combo.image_id = data['image_id']
            if 'image_url' in data:
                combo.image_url = data['image_url']
            if 'category_id' in data:
                combo.category_id = data['category_id']
            if 'is_active' in data:
                combo.is_active = data['is_active']
            if 'max_per_order' in data:
                combo.max_per_order = data['max_per_order']

            if items_data is not None:
                # Remove existing items
                ComboItem.query.filter_by(combo_id=combo.id).delete()
                db.session.flush()

                for item_data in items_data:
                    product = Product.query.get(item_data['product_id'])
                    if not product:
                        raise ValueError(f"Producto con ID {item_data['product_id']} no encontrado")
                    combo_item = ComboItem(
                        combo_id=combo.id,
                        product_id=item_data['product_id'],
                        quantity=item_data.get('quantity', 1),
                        is_optional=item_data.get('is_optional', False),
                        allow_size_variant=item_data.get('allow_size_variant', True)
                    )
                    db.session.add(combo_item)

            db.session.commit()
            return combo_schema.dump(combo)
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_combo(combo_id):
        try:
            combo = Combo.query.get(combo_id)
            if not combo:
                return False
            db.session.delete(combo)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_combo_profit_analysis(combo_id):
        """Calcula rentabilidad de un combo: precio vs costo de componentes"""
        combo = Combo.query.get(combo_id)
        if not combo:
            return None

        total_cost = 0
        components = []
        for ci in combo.items:
            if ci.product:
                cost = (ci.product.purchase_price or 0) * ci.quantity
                total_cost += cost
                components.append({
                    'product_id': ci.product.id,
                    'name': ci.product.name,
                    'quantity': ci.quantity,
                    'cost': cost,
                    'unit_cost': ci.product.purchase_price or 0
                })

        selling_price = combo.promo_price or combo.price
        profit = selling_price - total_cost
        margin = round((profit / selling_price * 100), 1) if selling_price > 0 else 0

        return {
            'combo_id': combo.id,
            'combo_name': combo.name,
            'selling_price': selling_price,
            'total_cost': total_cost,
            'profit': profit,
            'margin': margin,
            'components': components
        }