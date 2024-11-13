from flask import Flask
from config import Config
from .extensions import init_extensions
from back.api.auth_routes import auth_blueprint
from back.api.dashboard_routes import dashboard_blueprint
from back.api.dobrodel_routes import dobrodel_blueprint
from back.api.role_routes import role_blueprint
from back.api.pattern_routes import pattern_blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    app.register_blueprint(dashboard_blueprint, url_prefix='/api')
    app.register_blueprint(dobrodel_blueprint, url_prefix='/api')
    app.register_blueprint(role_blueprint, url_prefix='/api')
    app.register_blueprint(pattern_blueprint,url_prefix='/api')

    return app