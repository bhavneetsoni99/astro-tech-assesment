from flask import Blueprint

api_bp = Blueprint("api", __name__, url_prefix="/api/v1")

from app.routes.players import *
from app.routes.pitches import *
from app.routes.health import *