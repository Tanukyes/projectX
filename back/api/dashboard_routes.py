from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from back.models import User

dashboard_blueprint = Blueprint('dashboard', __name__)

@dashboard_blueprint.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        return jsonify({"msg":f"Добро пожаловать, {user.username}!"}), 200
    except Exception as e:
        return jsonify({"error": "Ошибка базы данных", "details": str(e)}), 500

@dashboard_blueprint.route('/admin', methods=['GET'])
@jwt_required()
def get_admin_data():
    try:
        # Запрос к базе данных или логика для данных администратора
        data = {"msg": "Данные для администратора"}  # Пример данных
        return jsonify(data), 200
    except Exception as e:
        # Если возникает ошибка, верните понятный ответ
        return jsonify({"error": "Ошибка базы данных", "details": str(e)}), 500
