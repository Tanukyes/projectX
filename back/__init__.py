from flask import Flask
from .config import Config
from .extensions import init_extensions
from .api.auth_routes import auth_blueprint
from .api.dashboard_routes import dashboard_blueprint
from .api.dobrodel_routes import dobrodel_blueprint
from .api.role_routes import role_blueprint
from .api.pattern_routes import pattern_blueprint
from .api.change_log_routes import change_log_blueprint
from .api.documentation_routes import documentation_blueprint
from .api.time_logs_routes import time_logs_blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    app.register_blueprint(dashboard_blueprint, url_prefix='/api')
    app.register_blueprint(dobrodel_blueprint, url_prefix='/api')
    app.register_blueprint(role_blueprint, url_prefix='/api')
    app.register_blueprint(pattern_blueprint,url_prefix='/api')
    app.register_blueprint(time_logs_blueprint,url_prefix='/api')
    app.register_blueprint(change_log_blueprint, url_prefix='/api')
    app.register_blueprint(documentation_blueprint, url_prefix='/api')

    return app