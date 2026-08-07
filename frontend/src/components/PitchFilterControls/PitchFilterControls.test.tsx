import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PitchFilterControls from "./PitchFilterControls";

const mockPitchNames = ["Fastball", "Slider", "Changeup"];
const mockPlayers = [
  { player_id: 453286, first_name: "Maxwell", last_name: "Scherzer" },
  { player_id: 506433, first_name: "Yu", last_name: "Darvish" },
];
const mockTeams = ["TOR", "SD", "LAD"];

describe("PitchFilterControls", () => {
  test("renders the legend, selects, and clear button", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText("Filter Pitches")).toBeInTheDocument();
    expect(screen.getByLabelText("Pitch Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Pitcher")).toBeInTheDocument();
    expect(screen.getByLabelText("Pitching Team")).toBeInTheDocument();
    expect(screen.getByLabelText("Batter")).toBeInTheDocument();
    expect(screen.getByLabelText("Speed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear Filters" })).toBeInTheDocument();
  });

  test("displays the currently selected pitch name filter", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        filters={{ pitch_name: "Slider" }}
        onFilterChange={vi.fn()}
      />
    );

    const pitchTypeSelect = screen.getByLabelText("Pitch Type") as HTMLSelectElement;
    expect(pitchTypeSelect.value).toBe("Slider");
  });

  test("displays the currently selected pitcher filter", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        filters={{ pitcher: 453286 }}
        onFilterChange={vi.fn()}
      />
    );

    const pitcherSelect = screen.getByLabelText("Pitcher") as HTMLSelectElement;
    expect(pitcherSelect.value).toBe("453286");
  });

  test("displays the currently selected pitching team filter", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        filters={{ pitching_team: "SD" }}
        onFilterChange={vi.fn()}
      />
    );

    const teamSelect = screen.getByLabelText("Pitching Team") as HTMLSelectElement;
    expect(teamSelect.value).toBe("SD");
  });

  test("selecting a pitch name calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Pitch Type"), {
      target: { value: "Fastball" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("selecting a pitcher calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Pitcher"), {
      target: { value: "453286" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("selecting a pitching team calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Pitching Team"), {
      target: { value: "TOR" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("selecting a batter calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Batter"), {
      target: { value: "506433" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("Clear Filters button resets filters", () => {
    const onFilterChange = vi.fn();

    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        filters={{ pitch_name: "Fastball", pitcher: 453286 }}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  test("renders pitch name options from availablePitchNames", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={vi.fn()}
      />
    );

    const pitchTypeSelect = screen.getByLabelText("Pitch Type");
    const options = Array.from(pitchTypeSelect.querySelectorAll("option"));
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain("Fastball");
    expect(optionTexts).toContain("Slider");
    expect(optionTexts).toContain("Changeup");
  });

  test("renders team options from availableTeams", () => {
    render(
      <PitchFilterControls
        availablePitchNames={mockPitchNames}
        availablePlayers={mockPlayers}
        availableTeams={mockTeams}
        onFilterChange={vi.fn()}
      />
    );

    const teamSelect = screen.getByLabelText("Pitching Team");
    const options = Array.from(teamSelect.querySelectorAll("option"));
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain("TOR");
    expect(optionTexts).toContain("SD");
    expect(optionTexts).toContain("LAD");
  });
});
