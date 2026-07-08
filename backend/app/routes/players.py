from flask import request, jsonify
from sqlalchemy import select
from app import db
from app.schemas import PlayerSchema
from app.routes import api_bp
from app.models import Player

players_schema = PlayerSchema(many=True)
player_schema = PlayerSchema()

@api_bp.route("/players", methods=["GET"])
def get_players():
    """
    Get all players or filter by team/position.
    """
    team_arg = request.args.get("team")
    position_arg = request.args.get("position")
    throws_arg = request.args.get("throws")
    bats_arg = request.args.get("bats")

    select_players = select(Player)

    if team_arg:
        normalized_team_name = team_arg.strip().lower()
        select_players = select_players.where(Player.team.ilike(normalized_team_name))

    if position_arg:
        normalized_position = position_arg.strip().lower()
        select_players = select_players.where(Player.primary_position.ilike(normalized_position))

    if throws_arg:
        normalized_throws = throws_arg.strip().lower()
        select_players = select_players.where(Player.throws.ilike(normalized_throws))

    if bats_arg:
        normalized_bats = bats_arg.strip().lower()
        select_players = select_players.where(Player.bats.ilike(normalized_bats))

    players = db.session.execute(select_players).scalars().all()

    return jsonify(players_schema.dump(players)), 200

@api_bp.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    select_player = select(Player).where(Player.player_id == player_id)
    player = db.session.scalar(select_player)
    if player is None:
        return jsonify({"error": "Player not found"}), 404
    return jsonify(player_schema.dump(player)), 200


@api_bp.route("/teams", methods=["GET"])
def get_teams():
    select_teams = select(Player.team).distinct().order_by(Player.team.asc())
    teams = db.session.execute(select_teams).scalars().all()
    return jsonify(teams), 200


@api_bp.route("/players_list", methods=["GET"])
def get_players_list():
    select_players = select(Player.player_id, Player.first_name, Player.last_name).order_by(Player.first_name.asc())
    players = db.session.execute(select_players).mappings().all()
    players_list = [dict(row) for row in players]
    return jsonify(players_list), 200

@api_bp.route("/positions", methods=["GET"])
def get_positions():
    select_positions = select(Player.primary_position).distinct().order_by(Player.primary_position.asc())
    positions = db.session.execute(select_positions).scalars().all()
    return jsonify(positions), 200
