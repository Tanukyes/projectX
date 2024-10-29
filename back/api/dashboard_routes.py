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