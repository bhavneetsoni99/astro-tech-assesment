import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerTable from "./PlayerTable";
import { Player } from "../../types";
import * as utils from "../../utils/utils";

vi.mock("../../utils/utils", () => ({
  getAge: vi.fn(() => 25),
}));

const mockPlayers: Player[] = [
    {
      player_id: 453286,
      first_name: 'Maxwell',
      last_name: 'Scherzer',
      bats: 'R',
      throws: 'R',
      birth_country: 'USA',
      birth_state: 'MO',
      birthdate: '1984-07-27',
      height_feet: 6,
      height_inches: 3,
      weight: 208,
      team: 'TOR',
      primary_position: 'RHS'
    },
    {
      player_id: 506433,
      first_name: 'Yu',
      last_name: 'Darvish',
      bats: 'R',
      throws: 'R',
      birth_country: 'Japan',
      birth_state: 'NULL',
      birthdate: '1986-08-16',
      height_feet: 6,
      height_inches: 5,
      weight: 220,
      team: 'SD',
      primary_position: 'RHS'
    }
  ]

describe("PlayerTable", () => {
  test("renders loading state", () => {
    render(<PlayerTable players={[]} isLoading={true} />);
    expect(screen.getByText("Loading players...")).toBeInTheDocument();
  });

  test("renders error state", () => {
    render(<PlayerTable players={[]} error="Failed to fetch" />);
    expect(screen.getByText("Error: Failed to fetch")).toBeInTheDocument();
  });

  test("renders empty state when no players", () => {
    render(<PlayerTable players={[]} />);
    expect(screen.getByText("No players found.")).toBeInTheDocument();
  });

  test("displays correct player count", () => {
    render(<PlayerTable players={mockPlayers} />);
    expect(screen.getByText("Players (2 players)")).toBeInTheDocument();
  });

  test("renders all table headers", () => {
    render(<PlayerTable players={mockPlayers} />);
    const headers = ["Name", "Team", "Position", "Bats", "Throws", "Age", "Height", "Weight", "Birth Place"];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test("renders player data correctly", () => {
    render(<PlayerTable players={mockPlayers} />);
    expect(screen.getByTestId("player-row-453286")).toBeInTheDocument();
  });


  test("calls getAge with correct birthdate for each player", () => {
    render(<PlayerTable players={mockPlayers} />);
    expect(utils.getAge).toHaveBeenCalledWith("1984-07-27");
    expect(utils.getAge).toHaveBeenCalledWith("1986-08-16");
  });

  test("renders birth place values", () => {
    render(<PlayerTable players={mockPlayers} />);
    expect(screen.getByText("MO, USA")).toBeInTheDocument();
  });


  test("renders correct number of rows", () => {
    const { container } = render(<PlayerTable players={mockPlayers} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });
});
