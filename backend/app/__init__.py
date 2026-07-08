from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import config_by_name

db = SQLAlchemy()
cors = CORS()

def create_app(config_name="development") -> Flask:
    '''Factory funtion to create app'''
    app = Flask(__name__)
    
    app.config.from_object(config_by_name[config_name])
    
    db.init_app(app)
    cors.init_app(app)
    
    from app.routes import api_bp
    
    app.register_blueprint(api_bp)
    
    return app