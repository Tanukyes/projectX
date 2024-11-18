from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_cors import cross_origin
from back.models.user import User
from back.models.role import Role
from back.extensions import db

auth_blueprint = Blueprint('auth', __name__)

# Регистрация пользователя
@auth_blueprint.route('/register', methods=['POST'])
@jwt_required()
@cross_origin()
def register():
    try:
        current_user = get_jwt_identity()

        # Проверка, что текущий пользователь — администратор
        if current_user['role'] != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_name = data.get('role', 'user')
        fio = data.get('fio', '')  # Новое поле ФИО
        room = data.get('room', '')  # Новое поле Комната

        # Проверка наличия обязательных полей
        if not all([username, email, password]):
            return jsonify({"msg": "Все поля обязательны"}), 400

        # Проверка существования роли
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return jsonify({"msg": "Роль не существует"}), 400

        # Проверка уникальности email
        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Email уже зарегистрирован"}), 400

        # Создание нового пользователя
        new_user = User(username=username, email=email, role=role, fio=fio, room=room)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "Пользователь успешно создан"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Ошибка при создании пользователя", "error": str(e)}), 500


# Редактирование пользователя
@auth_blueprint.route('/edit_user/<int:user_id>', methods=['POST'])
@jwt_required()
@cross_origin()
def edit_user(user_id):
    try:
        current_user = get_jwt_identity()

        # Проверка, что текущий пользователь — администратор
        if current_user['role'] != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_name = data.get('role')
        fio = data.get('fio')
        room = data.get('room')

        # Обновление данных пользователя
        if username:
            user.username = username
        if email:
            user.email = email
        if password:
            user.set_password(password)  # Хэшируем пароль перед сохранением
        if role_name:
            role = Role.query.filter_by(name=role_name).first()
            if role:
                user.role = role
        if fio:
            user.fio = fio
        if room:
            user.room = room

        db.session.commit()
        return jsonify({"msg": "Данные пользователя успешно обновлены"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Ошибка при обновлении данных пользователя", "error": str(e)}), 500


# Удаление пользователя
@auth_blueprint.route('/delete_user/<int:user_id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_user(user_id):
    try:
        current_user = get_jwt_identity()

        # Проверка, что текущий пользователь — администратор
        if current_user['role'] != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "Пользователь успешно удален"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Ошибка при удалении пользователя", "error": str(e)}), 500


# Логин пользователя
@auth_blueprint.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    email_or_username = data.get('emailOrUsername')
    password = data.get('password')

    user = User.query.filter((User.email == email_or_username) | (User.username == email_or_username)).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Неверные учетные данные"}), 401

    access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
    return jsonify(access_token=access_token, role=user.role.name), 200


# Получение списка пользователей
@auth_blueprint.route('/users', methods=['GET'])
@jwt_required()
@cross_origin()
def get_users():
    try:
        current_user = get_jwt_identity()

        # Проверка, что текущий пользователь — администратор
        if current_user['role'] != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        users = User.query.all()
        users_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "fio": user.fio,  # Добавление поля ФИО
                "room": user.room,  # Добавление поля Комната
                "role": user.role.name
            }
            for user in users
        ]
        return jsonify(users_data), 200

    except Exception as e:
        return jsonify({"msg": "Ошибка при получении списка пользователей", "error": str(e)}), 500
