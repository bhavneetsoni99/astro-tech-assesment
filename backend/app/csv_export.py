import pandas as pd


def export_players_csv(players: list) -> str:
    records = [
        {
            "player_id": p.player_id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "birthdate": p.birthdate,
            "birth_country": p.birth_country,
            "birth_state": p.birth_state,
            "height_feet": p.height_feet,
            "height_inches": p.height_inches,
            "weight": p.weight,
            "team": p.team,
            "primary_position": p.primary_position,
            "throws": p.throws,
            "bats": p.bats,
        }
        for p in players
    ]
    return pd.DataFrame(records).to_csv(index=False)


def export_pitches_csv(pitches: list) -> str:
    records = [
        {
            "rowid": p.rowid,
            "pitch_type": p.pitch_type,
            "game_date": p.game_date,
            "pitch_name": p.pitch_name,
            "pitcher_id": p.pitcher,
            "pitcher_name": f"{p.pitcher_details.first_name} {p.pitcher_details.last_name}"
            if p.pitcher_details
            else "",
            "pitcher_team": p.pitcher_details.team if p.pitcher_details else "",
            "batter_id": p.batter,
            "batter_name": f"{p.batter_details.first_name} {p.batter_details.last_name}"
            if p.batter_details
            else "",
            "batter_team": p.batter_details.team if p.batter_details else "",
            "release_speed": p.release_speed,
            "release_spin_rate": p.release_spin_rate,
            "release_pos_x": p.release_pos_x,
            "release_pos_z": p.release_pos_z,
            "plate_x": p.plate_x,
            "plate_z": p.plate_z,
            "zone": p.zone,
            "type": p.type,
            "description": p.description,
            "events": p.events,
            "balls": p.balls,
            "strikes": p.strikes,
            "outs_when_up": p.outs_when_up,
            "inning": p.inning,
            "inning_topbot": p.inning_topbot,
            "launch_speed": p.launch_speed,
            "launch_angle": p.launch_angle,
            "hit_distance_sc": p.hit_distance_sc,
            "stand": p.stand,
            "p_throws": p.p_throws,
            "home_team": p.home_team,
            "away_team": p.away_team,
        }
        for p in pitches
    ]
    return pd.DataFrame(records).to_csv(index=False)
