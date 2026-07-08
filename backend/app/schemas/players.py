from marshmallow import Schema, fields, validate

class PlayerSchema(Schema):
    """Schema for player data validation and serialization."""

    player_id = fields.Integer(required=True)
    first_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    birthdate = fields.String(required=True)
    birth_country = fields.String(allow_none=True)
    birth_state = fields.String(allow_none=True)
    height_feet = fields.Integer(required=True, validate=validate.Range(min=4, max=8))
    height_inches = fields.Integer(
        required=True, validate=validate.Range(min=0, max=11)
    )
    weight = fields.Integer(required=True, validate=validate.Range(min=100, max=400))
    team = fields.String(required=True, validate=validate.Length(min=2, max=3))
    primary_position = fields.String(required=True)
    throws = fields.String(required=True, validate=validate.OneOf(["R", "L"]))
    bats = fields.String(required=True, validate=validate.OneOf(["R", "L", "S"]))

