from app.extensions import db
from app.models.payment_method import PaymentMethod
from app.schemas.payment_method_schema import PaymentMethodSchema

payment_method_schema = PaymentMethodSchema()
payment_methods_schema = PaymentMethodSchema(many=True)

DEFAULT_PAYMENT_METHODS = [
    {'name': 'Efectivo', 'code': 'EFECTIVO', 'icon': 'AttachMoneyIcon', 'color': '#22c55e', 'is_cash': True, 'sort_order': 1},
    {'name': 'Tarjeta', 'code': 'TARJETA', 'icon': 'CreditCardIcon', 'color': '#3b82f6', 'is_cash': False, 'sort_order': 2},
    {'name': 'Transferencia', 'code': 'TRANSFERENCIA', 'icon': 'AccountBalanceIcon', 'color': '#2563eb', 'is_cash': False, 'sort_order': 3},
    {'name': 'Nequi', 'code': 'NEQUI', 'icon': 'SmartphoneIcon', 'color': '#06b6d4', 'is_cash': False, 'sort_order': 4},
    {'name': 'Daviplata', 'code': 'DAVIPLATA', 'icon': 'SmartphoneIcon', 'color': '#f59e0b', 'is_cash': False, 'sort_order': 5},
]

class PaymentMethodService:
    @staticmethod
    def get_payment_methods(store_id, only_active=True):
        query = PaymentMethod.query.filter_by(store_id=store_id)
        if only_active:
            query = query.filter_by(is_active=True)
        methods = query.order_by(PaymentMethod.sort_order).all()
        return payment_methods_schema.dump(methods)

    @staticmethod
    def get_payment_method(store_id, method_id):
        pm = PaymentMethod.query.filter_by(id=method_id, store_id=store_id).first()
        return payment_method_schema.dump(pm) if pm else None

    @staticmethod
    def get_by_code(store_id, code):
        return PaymentMethod.query.filter_by(store_id=store_id, code=code).first()

    @staticmethod
    def create_payment_method(store_id, data):
        existing = PaymentMethod.query.filter_by(store_id=store_id, code=data['code']).first()
        if existing:
            raise ValueError(f"Ya existe un método de pago con el código '{data['code']}'.")

        pm = PaymentMethod(
            store_id=store_id,
            name=data['name'],
            code=data['code'],
            icon=data.get('icon'),
            color=data.get('color', '#3b82f6'),
            is_cash=data.get('is_cash', False),
            is_active=data.get('is_active', True),
            sort_order=data.get('sort_order', 0)
        )
        db.session.add(pm)
        db.session.commit()
        return payment_method_schema.dump(pm)

    @staticmethod
    def update_payment_method(store_id, method_id, data):
        pm = PaymentMethod.query.filter_by(id=method_id, store_id=store_id).first()
        if not pm:
            raise ValueError("Método de pago no encontrado.")

        if 'code' in data and data['code'] != pm.code:
            existing = PaymentMethod.query.filter_by(store_id=store_id, code=data['code']).first()
            if existing:
                raise ValueError(f"Ya existe un método de pago con el código '{data['code']}'.")

        for key in ('name', 'code', 'icon', 'color', 'is_cash', 'is_active', 'sort_order'):
            if key in data:
                setattr(pm, key, data[key])

        db.session.commit()
        return payment_method_schema.dump(pm)

    @staticmethod
    def delete_payment_method(store_id, method_id):
        pm = PaymentMethod.query.filter_by(id=method_id, store_id=store_id).first()
        if not pm:
            raise ValueError("Método de pago no encontrado.")
        db.session.delete(pm)
        db.session.commit()
        return True

    @staticmethod
    def seed_defaults(store_id):
        existing_count = PaymentMethod.query.filter_by(store_id=store_id).count()
        if existing_count > 0:
            return

        for data in DEFAULT_PAYMENT_METHODS:
            pm = PaymentMethod(
                store_id=store_id,
                name=data['name'],
                code=data['code'],
                icon=data['icon'],
                color=data['color'],
                is_cash=data['is_cash'],
                is_active=True,
                sort_order=data['sort_order']
            )
            db.session.add(pm)
        db.session.commit()
