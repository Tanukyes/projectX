# back/api/role_routes.py
from flask import Blueprint, jsonify
from back.models.role import Role

role_blueprint = Blueprint('roles', __name__)

@role_blueprint.route('/roles', methods=['GET'])
def get_roles():
    roles = Role.query.all()
    return jsonify([{"id": role.id, "name": role.name} for role in roles])