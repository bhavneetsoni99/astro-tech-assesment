from flask import request, jsonify
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload, aliased
from app import db
from app.routes import api_bp
from app.models import Player, Pitch
from app.schemas import PitchSchema

pitches_schema = PitchSchema(many=True)

@api_bp.route("/pitches", methods=["GET"])
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

    limit = request.args.get("limit", default=500, type=int)
    cursor = request.args.get("next_cursor", default=None, type=int)

    Pitcher = aliased(Player)
    Batter = aliased(Player)

    select_pitches = select(Pitch)

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
        select_pitches = select_pitches.join(
            Pitch.pitcher_details.of_type(Pitcher)
        ).where(Pitcher.team == pitching_team_arg)

    if batting_team_arg:
        select_pitches = select_pitches.join(
            Pitch.batter_details.of_type(Batter)
        ).where(Batter.team == batting_team_arg)

    total_count = None
    if cursor is None:
        count_query = select(func.count()).select_from(select_pitches.subquery())
        total_count = db.session.scalar(count_query)

    select_pitches = select_pitches.order_by(Pitch.rowid.asc())

    if cursor is not None:
        select_pitches = select_pitches.where(Pitch.rowid > cursor)
        total_count = None

    paginated_query = select_pitches.limit(limit)

    pitches = db.session.scalars(
        paginated_query.options(
            joinedload(getattr(Pitch, "pitcher_details")),
            joinedload(getattr(Pitch, "batter_details"))
        )
    ).all()

    next_cursor = pitches[-1].rowid if pitches and len(pitches) == limit else None

    result = pitches_schema.dump(pitches)

    return jsonify({
        "pitches": result,
        "total_count": total_count,
        "next_cursor": next_cursor,
        "limit": limit
    }), 200

@api_bp.route("/pitch_names", methods=["GET"])
def get_pitch_names():
    """Get all distinct pitch names sorted alphabetically."""
    select_pitch_names = select(Pitch.pitch_name).distinct().order_by(Pitch.pitch_name.asc())
    pitch_names = db.session.execute(select_pitch_names).scalars().all()
    return jsonify(pitch_names), 200
