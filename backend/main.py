from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select
import os
import pandas as pd
from typing import List, Optional
from schemas import PitchSchema, PlayerSchema
from pathlib import Path

# Initialize Flask app and extensions
app = Flask(__name__)
CORS(app)

# Get the directory where main.py is located
BASE_DIR = Path(__file__).resolve().parent
print(f"Base directory: {BASE_DIR}")
DB_PATH = BASE_DIR / "data" / "baseball.db"
print(f"Using database path: {DB_PATH}")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Database Models
class Player(db.Model):
    """SQLAlchemy model for player data."""

    __tablename__ = "players"

    player_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birthdate = db.Column(db.String, nullable=False)
    birth_country = db.Column(db.String, nullable=True)
    birth_state = db.Column(db.String, nullable=True)
    height_feet = db.Column(db.Integer, nullable=False)
    height_inches = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Integer, nullable=False)
    team = db.Column(db.String(3), nullable=False)
    primary_position = db.Column(db.String, nullable=False)
    throws = db.Column(db.String(1), nullable=False)
    bats = db.Column(db.String(1), nullable=False)


class Pitch(db.Model):
    """SQLAlchemy model for pitch data."""

    __tablename__ = "pitches"

    rowid = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Pitch identification
    pitch_type = db.Column(db.String,  nullable=True)
    game_date = db.Column(db.String, nullable=False)

    # Pitcher and batter
    pitcher = db.Column(db.Integer, nullable=False)
    batter = db.Column(db.Integer, nullable=False)

    # Pitch characteristics
    release_speed = db.Column(db.String, nullable=True)
    release_spin_rate = db.Column(db.String, nullable=True)
    release_pos_x = db.Column(db.String, nullable=True)
    release_pos_z = db.Column(db.String, nullable=True)

    # Pitch location
    plate_x = db.Column(db.Float, nullable=True)
    plate_z = db.Column(db.Float, nullable=True)
    zone = db.Column(db.Integer, nullable=True)

    # Pitch result
    type = db.Column(db.String, nullable=True)  # S, B, X
    description = db.Column(db.String, nullable=True)
    events = db.Column(db.String, nullable=True)

    # Count and game situation
    balls = db.Column(db.Integer, nullable=True)
    strikes = db.Column(db.Integer, nullable=True)
    outs_when_up = db.Column(db.Integer, nullable=True)
    inning = db.Column(db.Integer, nullable=True)
    inning_topbot = db.Column(db.String, nullable=True)

    # Batted ball data
    launch_speed = db.Column(db.String, nullable=True)
    launch_angle = db.Column(db.String, nullable=True)
    hit_distance_sc = db.Column(db.String, nullable=True)

    # Player handedness
    stand = db.Column(db.String, nullable=True)  # L or R
    p_throws = db.Column(db.String, nullable=True)  # L or R

    # Teams
    home_team = db.Column(db.String, nullable=True)
    away_team = db.Column(db.String, nullable=True)


# Routes
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200

# TODO: Implement the routes for players and pitches below, feel free to modify them as necessary and/or create additional routes and helpers as needed.
@app.route("/players", methods=["GET"])
def get_players():
    """
    Get all players or filter by team/position.
    """
    team_arg = request.args.get("team")
    position_arg = request.args.get("position")

    selectPlayers = select(Player)

    if team_arg:
        normalized_team_name = team_arg.strip().lower()
        if normalized_team_name != 'all':
            selectPlayers = selectPlayers.where(Player.team.ilike(normalized_team_name))

    if position_arg:
        normalized_position = position_arg.strip().lower()
        if normalized_position != 'all':
            selectPlayers = selectPlayers.where(Player.primary_position.ilike(normalized_position))
    #  TODO: Housekeeping - Add pagination support to the players endpoint to limit the number of results returned per request. (page number and page size)
    #  TODO: Housekeeping - Add sorting support to the players endpoint to allow clients to sort the results by different fields (e.g., last name, team, position).
    #  TODO: Housekeeping - Add filtering support for more parameters 
   
    players = db.session.execute(selectPlayers).scalars().all()

    schema = PlayerSchema(many=True)
    result = schema.dump(players)
    return jsonify(result), 200

@app.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    """Get a single player by ID."""
    select_player = select(Player).where(Player.player_id == player_id)
    player = db.session.scalar(select_player)
    if player is None:
        return jsonify({"error": "Player not found"}), 404
    schema = PlayerSchema()
    return jsonify(schema.dump(player)), 200


@app.route("/teams", methods=["GET"])
def get_teams():
    select_teams = select(Player.team).distinct().order_by(Player.team.asc())
    teams = db.session.execute(select_teams).scalars().all()
    return jsonify(teams), 200

@app.route("/pitches", methods=["GET"])
def get_pitches():
    """
    Get all pitches or filter by various fields such as player, team, date, etc.
    """
    # TODO: Implement pitch retrieval with optional filtering
    # Below is a simple example returning a subset of pitches
    pitches = Pitch.query.limit(1000).all()
    schema = PitchSchema(many=True)
    result = schema.dump(pitches)

    return jsonify(result), 200
