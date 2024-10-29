from flask import Blueprint, jsonify, request
from ..models import WorkOrder  # модель, которая связана с таблицей dobrodel
from ..extensions import db

dobrodel_blueprint = Blueprint('dobrodel', __name__, url_prefix='/api')

@dobrodel_blueprint.route('/dobrodel', methods=['GET'])
def get_all_orders():
    try:
        print("Запрос к базе данных")
        orders = WorkOrder.query.all()
        orders_list = [order.to_dict() for order in orders]
        print("Успешное получение данных:", orders_list)
        return jsonify(orders_list), 200
    except Exception as e:
        print("Ошибка при подключении к базе данных:", e)
        return jsonify({"error": "Ошибка базы данных", "details": str(e)}), 500


@dobrodel_blueprint.route('/dobrodel', methods=['POST'])
def add_order():
    data = request.get_json()
    new_order = WorkOrder(
        order_number=data.get('orderNumber'),
        description=data.get('description'),
        field=data.get('task'),
        date_performed=data.get('date'),
        executor=data.get('performer'),
        note=data.get('note')
    )
    db.session.add(new_order)
    db.session.commit()
    return jsonify(new_order.to_dict()), 201

@dobrodel_blueprint.route('/dobrodel/<int:id>', methods=['DELETE'])
def delete_work_order(id):
    order = WorkOrder.query.get(id)
    if order:
        db.session.delete(order)
        db.session.commit()
        return jsonify({"message": "Запись удалена"}), 200
    return jsonify({"error": "Запись не найдена"}), 404

# PUT - обновление записи
@dobrodel_blueprint.route('/dobrodel/<int:id>', methods=['PUT'])
def update_work_order(id):
    data = request.get_json()
    order = WorkOrder.query.get(id)
    if order:
        order.order_number = data.get('orderNumber')
        order.description = data.get('description')
        order.field = data.get('task')
        order.date_performed = data.get('date')
        order.executor = data.get('performer')
        order.note = data.get('note')
        db.session.commit()
        return jsonify(order.to_dict()), 200
    return jsonify({"error": "Запись не найдена"}), 404
