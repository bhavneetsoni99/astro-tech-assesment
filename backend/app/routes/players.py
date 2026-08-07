from flask import request, jsonify, Response
from sqlalchemy import select
from app import db
from app.errors import ApiError
from app.schemas import PlayerSchema
from app.routes import api_bp
from app.models import Player
from app.csv_export import export_players_csv

players_schema = PlayerSchema(many=True)
player_schema = PlayerSchema()

VALID_THROWS = {"R", "L"}
VALID_BATS = {"R", "L", "S"}


def _get_filtered_players():
    team_arg = request.args.get("team")
    position_arg = request.args.get("position")
    throws_arg = request.args.get("throws")
    bats_arg = request.args.get("bats")

    if throws_arg and throws_arg.upper() not in VALID_THROWS:
        raise ApiError(400, f"Invalid throws value '{throws_arg}'. Must be R or L.")
    if bats_arg and bats_arg.upper() not in VALID_BATS:
        raise ApiError(400, f"Invalid bats value '{bats_arg}'. Must be R, L, or S.")

    select_players = select(Player)

    if team_arg:
        normalized_team_name = team_arg.strip().lower()
        select_players = select_players.where(Player.team.ilike(normalized_team_name))

    if position_arg:
        normalized_position = position_arg.strip().lower()
        select_players = select_players.where(
            Player.primary_position.ilike(normalized_position)
        )

    if throws_arg:
        normalized_throws = throws_arg.strip().lower()
        select_players = select_players.where(Player.throws.ilike(normalized_throws))

    if bats_arg:
        normalized_bats = bats_arg.strip().lower()
        select_players = select_players.where(Player.bats.ilike(normalized_bats))

    return db.session.execute(select_players).scalars().all()


@api_bp.route("/players", methods=["GET"])
def get_players():
    """Get all players or filter by team/position."""
    players = _get_filtered_players()
    return jsonify(players_schema.dump(players)), 200

@api_bp.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    """
    Get player details for the player_id.
    """
    select_player = select(Player).where(Player.player_id == player_id)
    player = db.session.scalar(select_player)
    if player is None:
        raise ApiError(404, f"Player with id {player_id} not found")
    return jsonify(player_schema.dump(player)), 200


@api_bp.route("/teams", methods=["GET"])
def get_teams():
    """
    Get sorted available team names
    """
    select_teams = select(Player.team).distinct().order_by(Player.team.asc())
    teams = db.session.execute(select_teams).scalars().all()
    return jsonify(teams), 200


@api_bp.route("/players_list", methods=["GET"])
def get_players_list():
    """
    Get players list sorted in ascending order based on First name.
    """
    select_players = (
        select(Player.player_id, Player.first_name, Player.last_name)
        .order_by(Player.first_name.asc())
    )
    players = db.session.execute(select_players).mappings().all()
    players_list = [dict(row) for row in players]
    return jsonify(players_list), 200

@api_bp.route("/positions", methods=["GET"])
def get_positions():
    """
    Get sorted available positions
    """
    select_positions = (
        select(Player.primary_position)
        .distinct()
        .order_by(Player.primary_position.asc())
    )
    positions = db.session.execute(select_positions).scalars().all()
    return jsonify(positions), 200


@api_bp.route("/players/download", methods=["GET"])
def download_players():
    """Download filtered players as CSV."""
    players = _get_filtered_players()
    return Response(
        export_players_csv(players),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=players.csv"},
    )
