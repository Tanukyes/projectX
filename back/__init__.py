from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Настройка CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Инициализация расширений
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Применение заголовков для обработки CORS
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Добавьте этот маршрут для обработки OPTIONS запросов
@app.route('/dashboard', methods=['OPTIONS'])
def dashboard_options():
    return '', 200

# Добавим маршрут для администраторов
@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_page():
    current_user = get_jwt_identity()


    # Проверяем, является ли текущий пользователь администратором
    if current_user['role'] != 'admin':
        return jsonify({"msg": "Access forbidden: Admins only"}), 403

    return jsonify({"msg": "Welcome to the admin page!"}), 200

# Регистрация blueprint'ов
from back.Routes import auth_blueprint
app.register_blueprint(auth_blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
