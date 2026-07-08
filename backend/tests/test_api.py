import os
import sys
from pathlib import Path

os.environ["RUNNING_BASEBALL_TESTS"] = "TRUE"

import pytest
from main import app
from app import db
from app.models import Player, Pitch

@pytest.fixture(scope="function")
def client():
    """Create a test client for the Flask application."""
    
    ctx = app.app_context()
    ctx.push()
    db.drop_all()
    db.create_all()

    player1 = Player(
        player_id=453286,
        first_name="Maxwell",
        last_name="Scherzer",
        birthdate="1984-07-27",
        birth_country="USA",
        birth_state="MO",
        height_feet=6,
        height_inches=3,
        weight=208,
        team="TOR",
        primary_position="RHS",
        throws="R",
        bats="R",
    )

    player2 = Player(
        player_id=506433,
        first_name="Yu",
        last_name="Darvish",
        birthdate="1986-08-16",
        birth_country="Japan",
        birth_state="NULL",
        height_feet=6,
        height_inches=5,
        weight=220,
        team="SD",
        primary_position="RHS",
        throws="R",
        bats="R",
    )
    player3 = Player(
        player_id=999999,
        first_name="Shohei",
        last_name="Ohtani",
        birthdate="1994-07-05",
        birth_country="Japan",
        birth_state="NULL",
        height_feet=6,
        height_inches=4,
        weight=210,
        team="LAD",
        primary_position="LHS",
        throws="R",
        bats="L",
    )

    pitch1 = Pitch(
        pitch_type="FF",
        game_date="2024-06-01",
        pitch_name="Fastball",
        pitcher=453286,
        batter=506433,
        release_speed="95.2",
        type="S",
        description="called_strike",
        events="called_strike",
    )
    pitch2 = Pitch(
        pitch_type="SL",
        game_date="2024-06-01",
        pitch_name="Slider",
        pitcher=453286,
        batter=999999,
        release_speed="88.1",
        type="B",
        description="ball",
        events="ball",
    )

    pitch3 = Pitch(
        pitch_type="FF",
        game_date="2024-06-02",
        pitch_name="Fastball",
        pitcher=506433,
        batter=453286,
        release_speed="92.7",
        type="X",
        description="hit_into_play",
        events="single",
    )

    db.session.add_all([player1, player2, player3])
    db.session.add_all([pitch1, pitch2, pitch3])
    db.session.commit()

    with app.test_client() as test_client:
        yield test_client

    db.session.remove()
    db.drop_all()
    ctx.pop()


class TestHealthCheck:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        """Test that health check returns 200 status."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "healthy"}


class TestPlayerAPI:
    """Test player-related API endpoints."""

    def test_get_all_players(self, client):
        """Test getting all players."""
        response = client.get("/api/v1/players")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3

        ids = {p["player_id"] for p in data}
        assert ids == {453286, 506433, 999999}

    def test_filter_players_by_team(self, client):
        """Test filtering players by team."""
        response = client.get("/api/v1/players?team=TOR")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 453286
        assert data[0]["team"] == "TOR"

    def test_filter_players_by_position(self, client):
        """Test filtering players by position."""
        response = client.get("/api/v1/players?position=LHS")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 999999

    def test_filter_players_by_team_and_position(self, client):
        """Test filtering players by both team and position."""
        response = client.get("/api/v1/players?team=SD&position=RHS")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 506433

    def test_filter_no_matches(self, client):
        """Test filtering with no matching results."""
        response = client.get("/api/v1/players?team=XYZ")
        assert response.status_code == 200
        data = response.get_json()
        assert data == []

    def test_get_player_by_id(self, client):
        """Test getting a specific player by ID."""
        response = client.get("/api/v1/players/453286")
        assert response.status_code == 200
        data = response.get_json()
        assert data["first_name"] == "Maxwell"
        assert data["last_name"] == "Scherzer"
        assert data["team"] == "TOR"

    def test_get_nonexistent_player(self, client):
        """Test getting a player that doesn't exist."""
        response = client.get("/api/v1/players/1")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data


class TestTeamsAPI:
    """Test teams-related API endpoints."""

    def test_get_teams(self, client):
        """Test getting all distinct teams sorted alphabetically."""
        response = client.get("/api/v1/teams")
        assert response.status_code == 200
        data = response.get_json()
        assert data == ["LAD", "SD", "TOR"]

class TestPositionsAPI:
    """Test positions-related API endpoints."""

    def test_get_positions(self, client):
        """Test getting all distinct positions sorted alphabetically."""
        response = client.get("/api/v1/positions")
        assert response.status_code == 200
        data = response.get_json()
        assert data == ["LHS", "RHS"]

class TestPitchesAPI:
    """Test pitch-related API endpoints."""

    def test_get_pitches_returns_all_pitches(self, client):
        """Test that the pitches endpoint returns the expected payload structure."""
        response = client.get("/api/v1/pitches")
        assert response.status_code == 200

        data = response.get_json()
        assert data["limit"] ==500
        assert data["total_count"] == 3
        assert data["next_cursor"] is None
        assert len(data["pitches"]) == 3
        assert {pitch["pitch_name"] for pitch in data["pitches"]} == {"Fastball", "Slider"}

    def test_get_pitches_filters_by_pitcher(self, client):
        """Test filtering pitches by pitcher ID."""
        response = client.get("/api/v1/pitches?pitcher=453286")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["pitches"]) == 2
        assert {pitch["pitcher"] for pitch in data["pitches"]} == {453286}
        assert {pitch["pitch_name"] for pitch in data["pitches"]} == {"Fastball", "Slider"}

    def test_get_pitches_filters_by_pitch_name(self, client):
        """Test filtering pitches by pitch name."""
        response = client.get("/api/v1/pitches?pitch_name=Fastball")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["pitches"]) == 2
        assert all(pitch["pitch_name"] == "Fastball" for pitch in data["pitches"])

    def test_get_pitches_filters_by_release_speed(self, client):
        """Test filtering pitches by a minimum release speed."""
        response = client.get("/api/v1/pitches?release_speed=90")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["pitches"]) == 2
        assert {pitch["pitch_name"] for pitch in data["pitches"]} == {"Fastball"}


class TestPitchNamesAPI:
    """Test pitch_names-related API endpoints."""

    def test_get_pitch_names(self, client):
        """Test getting all distinct pitch names sorted alphabetically."""
        response = client.get("/api/v1/pitch_names")
        assert response.status_code == 200
        data = response.get_json()
        assert data == ["Fastball", "Slider"]


class TestPlayersListAPI:
    """Test players_list-related API endpoints."""

    def test_get_players_list(self, client):
        """Test getting all players with their IDs, first and last names."""
        response = client.get("/api/v1/players_list")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3
        
        player_ids = {p["player_id"] for p in data}
        assert player_ids == {453286, 506433, 999999}
