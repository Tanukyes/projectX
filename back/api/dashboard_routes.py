from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

dashboard_blueprint = Blueprint('dashboard', __name__)

@dashboard_blueprint.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] == 'admin':
            data = {
                "message": "Добро пожаловать на панель администратора",
                "status": "success",
                "user": current_user
            }
        else:
            data = {
                "message": "Добро пожаловать на пользовательскую панель",
                "status": "success",
                "user": current_user
            }
        return jsonify(data), 200
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
