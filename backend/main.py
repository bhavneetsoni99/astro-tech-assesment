from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select, func
import os
import pandas as pd
from typing import List, Optional
from schemas import PitchSchema, PlayerSchema
from pathlib import Path
from sqlalchemy.orm import joinedload

BASE_DIR = Path(__file__).resolve().parent

if os.environ.get("RUNNING_BASEBALL_TESTS") == "TRUE":
    DB_PATH = BASE_DIR / "data" / "test_baseball_isolated.db"
else:
    DB_PATH = BASE_DIR / "data" / "baseball.db"
# Initialize Flask app and extensions
app = Flask(__name__)
CORS(app)

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
    pitch_name = db.Column(db.String, nullable=True)

    # Pitcher and batter
    pitcher = db.Column(db.Integer, db.ForeignKey("players.player_id"), nullable=False)
    batter = db.Column(db.Integer, db.ForeignKey("players.player_id"), nullable=False)
    pitcher_details = db.relationship("Player", foreign_keys=[pitcher], backref="pitches_as_pitcher")
    batter_details = db.relationship("Player", foreign_keys=[batter], backref="pitches_as_batter")

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

@app.route("/players", methods=["GET"])
def get_players():
    """
    Get all players or filter by team/position.
    """
    team_arg = request.args.get("team")
    position_arg = request.args.get("position")

    select_players = select(Player)

    if team_arg:
        normalized_team_name = team_arg.strip().lower()
        select_players = select_players.where(Player.team.ilike(normalized_team_name))

    if position_arg:
        normalized_position = position_arg.strip().lower()
        select_players = select_players.where(Player.primary_position.ilike(normalized_position))

    players = db.session.execute(select_players).scalars().all()

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
    """Get all distinct teams sorted alphabetically."""
    select_teams = select(Player.team).distinct().order_by(Player.team.asc())
    teams = db.session.execute(select_teams).scalars().all()
    return jsonify(teams), 200

@app.route("/positions", methods=["GET"])
def get_positions():
    """Get all distinct positions sorted alphabetically."""
    select_positions = select(Player.primary_position).distinct().order_by(Player.primary_position.asc())
    positions = db.session.execute(select_positions).scalars().all()
    return jsonify(positions), 200

@app.route("/pitches", methods=["GET"])
def get_pitches():
    """
    Get all pitches or filter by various fields such as player, team, date, etc.
    """
    pitcher_arg = request.args.get("pitcher")
    batter_arg = request.args.get("batter")
    pitch_name_arg = request.args.get("pitch_name")
    pitching_team_arg = request.args.get("pitching_team")
    batting_team_arg = request.args.get("batting_team")

    release_speed_arg = request.args.get("release_speed")

    limit = request.args.get("limit", default=1000, type=int)
    cursor = request.args.get("next_cursor", default=None, type=int)

    select_pitches = select(Pitch).order_by(Pitch.rowid.asc())

    if pitcher_arg:
        try:
            pitcher_int = int(pitcher_arg)
            select_pitches = select_pitches.where(Pitch.pitcher == pitcher_int)
        except ValueError:
            pass

    if batter_arg:
        try:
            batter_int = int(batter_arg)
            select_pitches = select_pitches.where(Pitch.batter == batter_int)
        except ValueError:
            pass

    if release_speed_arg:
        try:
            speed_val = float(release_speed_arg)
            select_pitches = select_pitches.where(Pitch.release_speed >= speed_val)
        except ValueError:
            pass

    if pitch_name_arg:
        select_pitches = select_pitches.where(Pitch.pitch_name == pitch_name_arg)

    if pitching_team_arg:
        select_pitches = select_pitches.join(Pitch.pitcher_details).where(
            Player.team == pitching_team_arg
        )

    if batting_team_arg:
        select_pitches = select_pitches.join(Pitch.batter_details).where(
            Player.team == batting_team_arg
        )

    total_count = None
    if cursor is None:
        count_query = select(func.count()).select_from(select_pitches.subquery())
        total_count = db.session.scalar(count_query)
    else:
        select_pitches = select_pitches.where(Pitch.rowid > cursor)
        total_count = None

    paginated_query = select_pitches.limit(limit)

    pitches = db.session.scalars(
        paginated_query.options(
            joinedload(getattr(Pitch, "pitcher_details")),
            joinedload(getattr(Pitch, "batter_details"))
        )
    ).all()

    next_cursor = pitches[-1].rowid if len(pitches) == limit else None

    schema = PitchSchema(many=True)
    result = schema.dump(pitches)

    return jsonify({
        "pitches": result,
        "total_count": total_count,
        "next_cursor": next_cursor,
        "limit": limit
    }), 200

@app.route("/pitch_names", methods=["GET"])
def get_pitch_names():
    """Get all distinct pitch names sorted alphabetically."""
    select_pitch_names = select(Pitch.pitch_name).distinct().order_by(Pitch.pitch_name.asc())
    pitch_names = db.session.execute(select_pitch_names).scalars().all()
    return jsonify(pitch_names), 200


@app.route("/players_list", methods=["GET"])
def get_players_list():
    """Get all players with their IDs, first and last names."""
    select_players = select(Player.player_id, Player.first_name, Player.last_name).order_by(Player.first_name.asc())
    players = db.session.execute(select_players).mappings().all()
    players_list = [dict(row) for row in players]
    return jsonify(players_list), 200