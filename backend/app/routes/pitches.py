from flask import request, jsonify, Response
from sqlalchemy import Float, cast, func, select
from sqlalchemy.orm import joinedload, aliased
from app import db
from app.errors import ApiError
from app.routes import api_bp
from app.models import Player, Pitch
from app.schemas import PitchSchema
from app.csv_export import export_pitches_csv

pitches_schema = PitchSchema(many=True)
pitch_schema = PitchSchema()

MAX_LIMIT = 1000
MIN_LIMIT = 1


def _build_filtered_pitch_query():
    pitcher_arg = request.args.get("pitcher")
    batter_arg = request.args.get("batter")
    pitch_name_arg = request.args.get("pitch_name")
    pitching_team_arg = request.args.get("pitching_team")
    batting_team_arg = request.args.get("batting_team")
    release_speed_arg = request.args.get("release_speed")

    pitcher_int: int | None = None
    if pitcher_arg:
        try:
            pitcher_int = int(pitcher_arg)
        except ValueError:
            raise ApiError(400, f"Invalid pitcher id '{pitcher_arg}'")

    batter_int: int | None = None
    if batter_arg:
        try:
            batter_int = int(batter_arg)
        except ValueError:
            raise ApiError(400, f"Invalid batter id '{batter_arg}'")

    speed_val: float | None = None
    if release_speed_arg:
        try:
            speed_val = float(release_speed_arg)
        except ValueError:
            raise ApiError(400, f"Invalid release_speed value '{release_speed_arg}'")

    Pitcher = aliased(Player)
    Batter = aliased(Player)

    select_pitches = select(Pitch)

    if pitcher_int is not None:
        select_pitches = select_pitches.where(Pitch.pitcher == pitcher_int)

    if batter_int is not None:
        select_pitches = select_pitches.where(Pitch.batter == batter_int)

    if speed_val is not None:
        select_pitches = select_pitches.where(
            cast(Pitch.release_speed, Float) >= speed_val
        )

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

    return select_pitches.order_by(Pitch.rowid.asc())


def _execute_pitch_query(select_pitches):
    return db.session.scalars(
        select_pitches.options(
            joinedload(getattr(Pitch, "pitcher_details")),
            joinedload(getattr(Pitch, "batter_details")),
        )
    ).all()


@api_bp.route("/pitches", methods=["GET"])
def get_pitches():
    """Get all pitches or filter by various fields such as player, team, date, etc."""
    limit = request.args.get("limit", default=500, type=int)
    cursor = request.args.get("next_cursor", default=None, type=int)

    if limit < MIN_LIMIT or limit > MAX_LIMIT:
        raise ApiError(400, f"Limit must be between {MIN_LIMIT} and {MAX_LIMIT}")

    select_pitches = _build_filtered_pitch_query()

    total_count = None
    if cursor is None:
        count_query = select(func.count()).select_from(select_pitches.subquery())
        total_count = db.session.scalar(count_query)

    if cursor is not None:
        select_pitches = select_pitches.where(Pitch.rowid > cursor)
        total_count = None

    paginated_query = select_pitches.limit(limit)
    pitches = _execute_pitch_query(paginated_query)

    next_cursor = pitches[-1].rowid if pitches and len(pitches) == limit else None
    result = pitches_schema.dump(pitches)

    return jsonify(
        {
            "pitches": result,
            "total_count": total_count,
            "next_cursor": next_cursor,
            "limit": limit,
        }
    ), 200


@api_bp.route("/pitches/<int:pitch_id>", methods=["GET"])
def get_pitch(pitch_id):
    """Get a single pitch by its rowid."""
    select_pitch = select(Pitch).where(Pitch.rowid == pitch_id)
    pitch = db.session.scalar(
        select_pitch.options(
            joinedload(getattr(Pitch, "pitcher_details")),
            joinedload(getattr(Pitch, "batter_details")),
        )
    )
    if pitch is None:
        raise ApiError(404, f"Pitch with id {pitch_id} not found")
    return jsonify(pitch_schema.dump(pitch)), 200


@api_bp.route("/pitch_names", methods=["GET"])
def get_pitch_names():
    """Get all distinct pitch names sorted alphabetically."""
    select_pitch_names = (
        select(Pitch.pitch_name).distinct().order_by(Pitch.pitch_name.asc())
    )
    pitch_names = db.session.execute(select_pitch_names).scalars().all()
    return jsonify(pitch_names), 200


@api_bp.route("/pitches/download", methods=["GET"])
def download_pitches():
    """Download filtered pitches as CSV."""
    select_pitches = _build_filtered_pitch_query()
    pitches = _execute_pitch_query(select_pitches)
    return Response(
        export_pitches_csv(pitches),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=pitches.csv"},
    )
