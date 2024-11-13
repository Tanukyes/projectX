from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from back.models.user import User
from back.models.role import Role
from back.extensions import db

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
@jwt_required()
def register():
    try:
        current_user = get_jwt_identity()
        print(f"Current user identity: {current_user}")  # Отладочное сообщение

        # Проверка, что текущий пользователь — администратор
        if current_user['role'] != 'admin':
            print("Access denied: User is not an admin")  # Отладочное сообщение
            return jsonify({"msg": "Доступ запрещен"}), 403

        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_name = data.get('role', 'user')

        # Проверка наличия обязательных полей
        if not all([username, email, password]):
            print("Error: Missing required fields")  # Отладочное сообщение
            return jsonify({"msg": "Заполните все поля"}), 400

        # Проверка существования роли
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            print(f"Error: Role '{role_name}' does not exist")  # Отладочное сообщение
            return jsonify({"msg": "Роль не существует"}), 400

        # Проверка существования email в базе
        if User.get_by_email(email):
            print("Error: Email already registered")  # Отладочное сообщение
            return jsonify({"msg": "Email уже зарегистрирован"}), 400

        # Создание нового пользователя
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        print("User successfully created")  # Отладочное сообщение

        return jsonify({"msg": "Пользователь успешно создан"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Exception occurred: {e}")  # Отладочное сообщение
        return jsonify({"msg": "Ошибка при создании пользователя", "error": str(e)}), 500

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email_or_username, password = data.get('emailOrUsername'), data.get('password')

    user = User.query.filter((User.email == email_or_username) | (User.username == email_or_username)).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Неверные учетные данные"}), 401

    access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
    return jsonify(access_token=access_token, role=user.role.name), 200