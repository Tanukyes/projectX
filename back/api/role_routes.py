# back/api/role_routes.py
from flask import Blueprint, jsonify
from back.models.role import Role

role_blueprint = Blueprint('roles', __name__)

@role_blueprint.route('/roles', methods=['GET'])
def get_roles():
    try:
        roles = Role.query.all()
        return jsonify([{"id": role.id, "name": role.name} for role in roles]),200
    except Exception as e:
        print(f"Ошибка:{e}")
        return jsonify({"msg": "Ошибка при загрузке ролей", "error": str(e)}),500
