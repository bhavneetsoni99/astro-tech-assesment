from flask import jsonify
from sqlalchemy import select, text
from app import db
from app.routes import api_bp


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint that also verifies database connectivity."""
    db_ok = False
    try:
        db.session.execute(select(text("1"))).scalar()
        db_ok = True
    except Exception:
        pass

    return jsonify({
        "status": "healthy",
        "database": "connected" if db_ok else "disconnected",
    }), 200 if db_ok else 503
