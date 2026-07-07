import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Player } from "../../types";
import { PlayerTable } from "./PlayerTable";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
    })),
  },
}));

vi.mock("../../utils", async () => ({
  getAge: vi.fn(() => 25),
  useSort: (await vi.importActual("../../utils")).useSort,
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

describe("PlayerTable integration", () => {
  test("shows loading state on mount, then renders players", async () => {
    mockGet.mockResolvedValue({ data: mockPlayers });

    const { container } = render(<PlayerTable />);

    expect(container.querySelector('[class*="loadingOverlay"]')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Maxwell Scherzer")).toBeInTheDocument();
    });

    expect(container.querySelector('[class*="loadingOverlay"]')).not.toBeInTheDocument();
    expect(screen.getByText("Yu Darvish")).toBeInTheDocument();
    expect(screen.getByText("2 Players")).toBeInTheDocument();
  });

  test("renders all expected columns", async () => {
    mockGet.mockResolvedValue({ data: mockPlayers });

    render(<PlayerTable />);

    const headers = ["Name", "Team", "Position", "Bats", "Throws", "Age", "Height", "Weight", "Birth Place"];
    await waitFor(() => {
      headers.forEach((header) => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });
  });

  test("transforms player data into table rows correctly", async () => {
    mockGet.mockResolvedValue({ data: mockPlayers });

    render(<PlayerTable />);

    await waitFor(() => {
      expect(screen.getByTestId("row-453286")).toBeInTheDocument();
    });

    expect(screen.getByTestId("row-506433")).toBeInTheDocument();
    expect(screen.getByText("Maxwell Scherzer")).toBeInTheDocument();
    expect(screen.getByText("TOR")).toBeInTheDocument();
    expect(screen.getAllByText("RHS")).toHaveLength(2);
    expect(screen.getByText("MO, USA")).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.getByText("6' 3\"")).toBeInTheDocument();
    expect(screen.getByText("6' 5\"")).toBeInTheDocument();
    expect(screen.getByText("208 lbs")).toBeInTheDocument();
    expect(screen.getByText("220 lbs")).toBeInTheDocument();
  });

  test("shows error state when API call fails", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    render(<PlayerTable />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error: Network error");
    });
  });

  test("refetches when filters change", async () => {
    mockGet.mockResolvedValue({ data: mockPlayers });

    const { rerender } = render(<PlayerTable filters={{}} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/players", {
        params: {},
      });
    });

    mockGet.mockClear();
    mockGet.mockResolvedValue({ data: [mockPlayers[0]] });

    rerender(<PlayerTable filters={{ team: "TOR" }} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/players", {
        params: { team: "TOR" },
      });
    });
  });

  test("applies all filter params to the API call", async () => {
    mockGet.mockResolvedValue({ data: [] });

    render(<PlayerTable filters={{ team: "SD", position: "RHS" }} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/players", {
        params: { team: "SD", position: "RHS" },
      });
    });
  });

  test("renders correct number of rows", async () => {
    mockGet.mockResolvedValue({ data: mockPlayers });

    const { container } = render(<PlayerTable />);

    await waitFor(() => {
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(2);
    });
  });
});
