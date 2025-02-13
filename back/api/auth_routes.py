from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_cors import cross_origin
from ..models import User, Role
from ..extensions import db
from flask_jwt_extended import create_access_token

auth_blueprint = Blueprint('auth', __name__)

# Регистрация пользователя
@auth_blueprint.route('/register', methods=['POST'])
@jwt_required()
@cross_origin()
def register():
    try:
        current_user = int(get_jwt_identity())
        claims = get_jwt()

        # Проверка роли администратора
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        # Получение данных из запроса
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Данные не предоставлены"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_name = data.get('role', 'user')
        fio = data.get('fio', '')
        room = data.get('room', '')

        # Проверка обязательных полей
        if not all([username, email, password]):
            return jsonify({"msg": "Все обязательные поля должны быть заполнены"}), 400

        # Проверка существования роли
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return jsonify({"msg": f"Роль '{role_name}' не существует"}), 400

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
        print(f"Ошибка при создании пользователя: {e}")
        return jsonify({"msg": "Ошибка при создании пользователя", "error": str(e)}), 500

# Редактирование пользователя
@auth_blueprint.route('/edit_user/<int:user_id>', methods=['POST'])
@jwt_required()
@cross_origin()
def edit_user(user_id):
    try:
        current_user = int(get_jwt_identity())
        claims = get_jwt()

        # Проверка роли администратора
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        # Получение данных из запроса
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Данные не предоставлены"}), 400

        # Обновление данных пользователя
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_name = data.get('role')
        fio = data.get('fio')
        room = data.get('room')

        if username:
            user.username = username
        if email:
            user.email = email
        if password:
            user.set_password(password)
        if role_name:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                return jsonify({"msg": f"Роль '{role_name}' не существует"}), 400
            user.role = role
        if fio:
            user.fio = fio
        if room:
            user.room = room

        db.session.commit()
        return jsonify({"msg": "Данные пользователя успешно обновлены"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при обновлении пользователя: {e}")
        return jsonify({"msg": "Ошибка при обновлении пользователя", "error": str(e)}), 500

# Удаление пользователя
@auth_blueprint.route('/delete_user/<int:user_id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_user(user_id):
    try:
        current_user = int(get_jwt_identity())
        claims = get_jwt()

        # Проверка роли администратора
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "Пользователь успешно удален"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при удалении пользователя: {e}")
        return jsonify({"msg": "Ошибка при удалении пользователя", "error": str(e)}), 500

# Логин пользователя
@auth_blueprint.route('/login', methods=['POST'])
@cross_origin()
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Данные не предоставлены"}), 400

        email_or_username = data.get('emailOrUsername')
        password = data.get('password')

        user = User.query.filter(
            (User.email == email_or_username) | (User.username == email_or_username)
        ).first()

        if not user or not user.check_password(password):
            return jsonify({"msg": "Неверные учетные данные"}), 401

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"username": user.username, "role": user.role.name, "fio": user.fio}
        )

        return jsonify(access_token=access_token, role=user.role.name), 200
    except Exception as e:
        print(f"Ошибка при входе: {e}")
        return jsonify({"msg": "Ошибка сервера", "error": str(e)}), 500

# Получение списка пользователей
@auth_blueprint.route('/users', methods=['GET'])
@jwt_required()
@cross_origin()
def get_users():
    try:
        current_user = int(get_jwt_identity())
        claims = get_jwt()

        # Проверка роли администратора
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Доступ запрещен"}), 403

        users = User.query.all()
        users_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "fio": user.fio,
                "room": user.room,
                "role": user.role.name
            }
            for user in users
        ]
        return jsonify(users_data), 200

    except Exception as e:
        print(f"Ошибка при получении списка пользователей: {e}")
        return jsonify({"msg": "Ошибка при получении списка пользователей", "error": str(e)}), 500
