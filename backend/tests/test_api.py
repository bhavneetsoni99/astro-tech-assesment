import pytest

from main import app, db, Player, Pitch


@pytest.fixture
def client():
    """Create a test client for the Flask application."""

    # Point to the actual baseball database for now
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()

            player1 = Player(
                id=453286,
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
                id=506433,
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
                id=999999,
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
            db.session.add_all([player1, player2, player3])
            db.session.commit()

            yield client


class TestHealthCheck:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        """Test that health check returns 200 status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "healthy"}


class TestPlayerAPI:
    """Test player-related API endpoints."""

    def test_get_all_players(self, client):
        """Test getting all players."""
        response = client.get("/players")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3

        ids = {p["player_id"] for p in data}
        assert ids == {453286, 506433, 999999}

    def test_filter_players_by_team(self, client):
        """Test filtering players by team."""
        response = client.get("/players?team=TOR")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 453286
        assert data[0]["team"] == "TOR"

    def test_filter_players_by_position(self, client):
        """Test filtering players by position."""
        response = client.get("/players?position=LHS")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 999999

    def test_filter_players_by_team_and_position(self, client):
        """Test filtering players by both team and position."""
        response = client.get("/players?team=SD&position=RHS")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["player_id"] == 506433

    def test_filter_no_matches(self, client):
        """Test filtering with no matching results."""
        response = client.get("/players?team=XYZ")
        assert response.status_code == 200
        data = response.get_json()
        assert data == []

def test_get_player_by_id(self, client):
        """Test getting a specific player by ID."""
        response = client.get("/players/453286")
        assert response.status_code == 200
        data = response.get_json()
        assert data["first_name"] == "Maxwell"
        assert data["last_name"] == "Scherzer"
        assert data["team"] == "TOR"

    def test_get_nonexistent_player(self, client):
        """Test getting a player that doesn't exist."""
        response = client.get("/players/1")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data


class TestTeamsAPI:
    """Test teams-related API endpoints."""

    def test_get_teams(self, client):
        """Test getting all distinct teams sorted alphabetically."""
        response = client.get("/teams")
        assert response.status_code == 200
        data = response.get_json()
        assert data == ["LAD", "SD", "TOR"]
