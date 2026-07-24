from app.extensions import db
from app.models.topping_group import ToppingGroup
from app.schemas.topping_group_schema import ToppingGroupSchema

topping_group_schema = ToppingGroupSchema()
topping_groups_schema = ToppingGroupSchema(many=True)

class ToppingGroupService:
    @staticmethod
    def get_topping_groups(store_id):
        groups = ToppingGroup.query.filter_by(store_id=store_id).order_by(ToppingGroup.name).all()
        return topping_groups_schema.dump(groups)

    @staticmethod
    def get_topping_group(store_id, group_id):
        group = ToppingGroup.query.filter_by(id=group_id, store_id=store_id).first()
        return topping_group_schema.dump(group) if group else None

    @staticmethod
    def create_topping_group(store_id, data):
        group = ToppingGroup(
            store_id=store_id,
            name=data['name'],
            config=data['config']
        )
        db.session.add(group)
        db.session.commit()
        return topping_group_schema.dump(group)

    @staticmethod
    def update_topping_group(store_id, group_id, data):
        group = ToppingGroup.query.filter_by(id=group_id, store_id=store_id).first()
        if not group:
            raise ValueError("Grupo de toppings no encontrado.")
        if 'name' in data:
            group.name = data['name']
        if 'config' in data:
            group.config = data['config']
        db.session.commit()
        return topping_group_schema.dump(group)

    @staticmethod
    def delete_topping_group(store_id, group_id):
        group = ToppingGroup.query.filter_by(id=group_id, store_id=store_id).first()
        if not group:
            raise ValueError("Grupo de toppings no encontrado.")
        db.session.delete(group)
        db.session.commit()
        return True
