import logging

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import config_by_name

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

db = SQLAlchemy()
cors = CORS()

def create_app(config_name="development") -> Flask:
    '''Factory funtion to create app'''
    app = Flask(__name__)
    
    app.config.from_object(config_by_name[config_name])
    
    db.init_app(app)
    cors.init_app(app)

    from app.errors import ApiError

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        app.logger.warning("ApiError %s: %s", error.status_code, error.message)
        return jsonify({"error": error.message, "status": error.status_code}), error.status_code

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed", "status": 405}), 405

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "Internal server error", "status": 500}), 500

    from app.routes import api_bp
    
    app.register_blueprint(api_bp)
    
    return app