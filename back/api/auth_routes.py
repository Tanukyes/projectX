from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from back.models.user import User
from back.models.role import Role
from back.extensions import db

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    role_name = data.get('role', 'user')

    if not all([username, email, password]):
        return jsonify({"msg": "Заполните все поля"}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"msg": "Роль не существует"}), 400

    if User.get_by_email(email):
        return jsonify({"msg": "Email уже зарегистрирован"}), 400

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
    email_or_username, password = data.get('emailOrUsername'), data.get('password')

    user = User.query.filter((User.email == email_or_username) | (User.username == email_or_username)).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Неверные учетные данные"}), 401

    access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
    return jsonify(access_token=access_token, role=user.role.name), 200