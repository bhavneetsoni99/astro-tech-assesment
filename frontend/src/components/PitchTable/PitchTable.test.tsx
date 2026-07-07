import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PitchTable } from "./PitchTable";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("../../services/api", () => ({
  default: {
    getPitches: mockGet,
  },
  ApiService: {
    getPitches: mockGet,
  },
}));

const mockPitchesResponse = {
  pitches: [
    {
      rowid: 1,
      pitch_type: "FF",
      pitch_name: "Fastball",
      release_speed: "95.2",
      type: "S",
      batter: 506433,
      batter_details: { first_name: "Yu", last_name: "Darvish", team: "SD" },
      pitcher: 453286,
      pitcher_details: { first_name: "Maxwell", last_name: "Scherzer", team: "TOR" },
      description: "called_strike",
      events: "called_strike",
      game_date: "2024-06-01",
    },
    {
      rowid: 2,
      pitch_type: "SL",
      pitch_name: "Slider",
      release_speed: "88.1",
      type: "B",
      batter: 999999,
      batter_details: { first_name: "Shohei", last_name: "Ohtani", team: "LAD" },
      pitcher: 453286,
      pitcher_details: { first_name: "Maxwell", last_name: "Scherzer", team: "TOR" },
      description: "ball",
      events: "ball",
      game_date: "2024-06-01",
    },
  ],
  total_count: 2,
  next_cursor: null,
  limit: 50,
};

describe("PitchTable", () => {
  test("shows loading state on mount, then renders pitches", async () => {
    mockGet.mockResolvedValue(mockPitchesResponse);

    const { container } = render(<PitchTable />);

    const spinnerOverlay = container.querySelector('[class*="loadingOverlay"]');
    expect(spinnerOverlay).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Yu Darvish")).toBeInTheDocument();
    });

    expect(screen.getByText("Shohei Ohtani")).toBeInTheDocument();
    expect(screen.getByText("2 Pitches")).toBeInTheDocument();
  });

  test("renders all expected columns", async () => {
    mockGet.mockResolvedValue(mockPitchesResponse);

    render(<PitchTable />);

    const headers = ["Pitcher", "Team(P)", "Type", "Speed", "Batter", "Team(B)", "Result", "Date"];
    await waitFor(() => {
      headers.forEach((header) => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });
  });

  test("transforms pitch data into table rows correctly", async () => {
    mockGet.mockResolvedValue(mockPitchesResponse);

    render(<PitchTable />);

    await waitFor(() => {
      expect(screen.getByTestId("row-1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("row-2")).toBeInTheDocument();
    expect(screen.getByText("Yu Darvish")).toBeInTheDocument();
    expect(screen.getByText("Shohei Ohtani")).toBeInTheDocument();
    expect(screen.getByText("Fastball")).toBeInTheDocument();
    expect(screen.getByText("Slider")).toBeInTheDocument();
    expect(screen.getByText("called_strike")).toBeInTheDocument();
  });

  test("shows error state when API call fails", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    render(<PitchTable />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error: Network error");
    });
  });

  test("refetches when filters change", async () => {
    mockGet.mockResolvedValue(mockPitchesResponse);

    const { rerender } = render(<PitchTable filters={{}} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });

    mockGet.mockClear();
    mockGet.mockResolvedValue({ ...mockPitchesResponse, pitches: [mockPitchesResponse.pitches[0]], total_count: 1 });

    rerender(<PitchTable filters={{ pitch_name: "Fastball" }} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({ pitch_name: "Fastball" })
      );
    });
  });

  test("renders correct number of rows", async () => {
    mockGet.mockResolvedValue(mockPitchesResponse);

    const { container } = render(<PitchTable />);

    await waitFor(() => {
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(2);
    });
  });

  describe("sorting", () => {
    test("renders sortable column headers", async () => {
      mockGet.mockResolvedValue(mockPitchesResponse);

      render(<PitchTable />);

      await waitFor(() => {
        const headers = screen.getAllByRole("columnheader");
        headers.forEach((header) => {
          expect(header).toHaveAttribute("tabindex", "0");
        });
      });
    });

    test("sorts by speed ascending when Speed column is clicked first", async () => {
      mockGet.mockResolvedValue(mockPitchesResponse);

      const { container } = render(<PitchTable />);

      await waitFor(() => {
        expect(screen.getByText("Slider")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Speed"));

      const speedCells = container.querySelectorAll("tbody tr td:nth-child(4)");
      expect(speedCells[0].textContent).toBe("88.1");
      expect(speedCells[1].textContent).toBe("95.2");
    });

    test("sorts by pitch type ascending when Type column is clicked", async () => {
      mockGet.mockResolvedValue(mockPitchesResponse);

      const { container } = render(<PitchTable />);

      await waitFor(() => {
        expect(screen.getByText("Slider")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Type"));

      const rows = container.querySelectorAll("tbody tr td:nth-child(3)");
      expect(rows[0].textContent).toBe("Fastball");
      expect(rows[1].textContent).toBe("Slider");
    });

    test("sorts by pitch type descending when Type column is clicked twice", async () => {
      mockGet.mockResolvedValue(mockPitchesResponse);

      const { container } = render(<PitchTable />);

      await waitFor(() => {
        expect(screen.getByText("Slider")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Type"));
      fireEvent.click(screen.getByText("Type"));

      const rows = container.querySelectorAll("tbody tr td:nth-child(3)");
      expect(rows[0].textContent).toBe("Slider");
      expect(rows[1].textContent).toBe("Fastball");
    });
  });
});
