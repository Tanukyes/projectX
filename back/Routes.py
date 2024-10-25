from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from back.models import User, Role

auth_blueprint = Blueprint('auth', __name__)
dashboard_blueprint = Blueprint('dashboard', __name__)

# Функция для поиска пользователя по email
def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role', 'user')

    if not all([username, email, password]):
        return jsonify({"msg": "Заполните все поля"}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"msg": "Указанная роль не существует"}), 400

    if get_user_by_email(email):
        return jsonify({"msg": "Пользователь с таким email уже существует"}), 400

    try:
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Ошибка при создании пользователя", "error": str(e)}), 500

    return jsonify({"msg": "Пользователь успешно создан"}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email_or_username = data.get('emailOrUsername')
    password = data.get('password')

    # Поиск пользователя по email или имени пользователя
    user = User.query.filter(
        (User.email == email_or_username) | (User.username == email_or_username)
    ).first()

    # Если пользователь не найден
    if not user:
        return jsonify({"msg": "Неверные учетные данные"}), 401

    # Проверка пароля
    if not user.check_password(password):
        return jsonify({"msg": "Неверные учетные данные"}), 401

    # Авторизация успешна, создаём токен
    access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
    return jsonify(access_token=access_token, role=user.role.name), 200

# Добавляем защиту для доступа к панели инструментов
@dashboard_blueprint.route('/dashboard', methods=['GET'])
@jwt_required()  # Требуется авторизация
def dashboard():
    current_user = get_jwt_identity()  # Получаем данные текущего пользователя из токена

    # Пример данных для разных ролей
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
