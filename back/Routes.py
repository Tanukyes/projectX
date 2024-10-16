from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from back import db
from back.models import User, Role

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role', 'user')

    if not all([username, email, password]):
        return jsonify({"msg": "Missing required fields"}), 400

    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long."}), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"msg": "User with this username or email already exists"}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"msg": "Role does not exist"}), 400

    try:
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to create user", "error": str(e)}), 500

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Получаем пользователя по email
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Извлекаем имя роли через связь
    role_name = user.role.name if user.role else 'user'  # Значение по умолчанию, если роль не указана

    # Создаем токен с именем роли
    access_token = create_access_token(identity={'username': user.username, 'role': role_name})
    return jsonify(access_token=access_token), 200

