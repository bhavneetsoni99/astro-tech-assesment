from marshmallow import Schema, fields, validate
from app.schemas import PlayerSchema

class PitchSchema(Schema):
    """Schema for pitch data validation and serialization."""

    rowid = fields.Integer(required=True)
    # Pitch identification
    pitch_type = fields.String(allow_none=True)
    game_date = fields.String(required=True)
    pitch_name = fields.String(allow_none=True)
    # Pitcher and batter
    pitcher = fields.Integer(required=True)
    pitcher_details = fields.Nested(PlayerSchema, only=["first_name", "last_name", "team"], allow_none=True)
    batter = fields.Integer(required=True)
    batter_details = fields.Nested(PlayerSchema, only=["first_name", "last_name", "team"], allow_none=True)

    # Pitch characteristics
    release_speed = fields.String(allow_none=True)
    # release_spin_rate = fields.String(allow_none=True)
    # release_pos_x = fields.String(allow_none=True)
    # release_pos_z = fields.String(allow_none=True)

    # Pitch location
    # plate_x = fields.Float(allow_none=True)
    # plate_z = fields.Float(allow_none=True)
    # zone = fields.Integer(allow_none=True)

    # Pitch result
    type = fields.String(allow_none=True)  # S, B, X
    description = fields.String(allow_none=True)
    events = fields.String(allow_none=True)

    # Count and game situation
    # balls = fields.Integer(allow_none=True)
    # strikes = fields.Integer(allow_none=True)
    # outs_when_up = fields.Integer(allow_none=True)
    # inning = fields.Integer(allow_none=True)
    # inning_topbot = fields.String(allow_none=True)

    # # Batted ball data
    # launch_speed = fields.String(allow_none=True)
    # launch_angle = fields.String(allow_none=True)
    # hit_distance_sc = fields.String(allow_none=True)

    # # Player handedness
    # stand = fields.String(allow_none=True)  # L or R
    # p_throws = fields.String(allow_none=True)  # L or R

    # # Teams
    # home_team = fields.String(allow_none=True)
    # away_team = fields.String(allow_none=True)
