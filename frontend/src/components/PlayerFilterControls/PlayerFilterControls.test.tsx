import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerFilterControls from "./PlayerFilterControls";

const mockTeams = ["TOR", "SD", "LAD"];
const mockPositions = ["RHS", "LHS", "RHP"];

describe("PlayerFilterControls", () => {
  test("renders the legend, selects, and clear button", () => {
    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText("Filter Players")).toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
    expect(screen.getByLabelText("Position")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear Filters" })).toBeInTheDocument();
  });

  test("displays the currently selected team filter", () => {
    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        filters={{ team: "SD" }}
        onFilterChange={vi.fn()}
      />
    );

    const teamSelect = screen.getByLabelText("Team") as HTMLSelectElement;
    expect(teamSelect.value).toBe("SD");
  });

  test("displays the currently selected position filter", () => {
    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        filters={{ position: "RHP" }}
        onFilterChange={vi.fn()}
      />
    );

    const positionSelect = screen.getByLabelText("Position") as HTMLSelectElement;
    expect(positionSelect.value).toBe("RHP");
  });

  test("selecting a team calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Team"), {
      target: { value: "TOR" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("selecting a position calls onFilterChange", () => {
    const onFilterChange = vi.fn();

    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Position"), {
      target: { value: "RHS" },
    });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test("Clear Filters button resets filters", () => {
    const onFilterChange = vi.fn();

    render(
      <PlayerFilterControls
        availableTeams={mockTeams}
        availablePositions={mockPositions}
        filters={{ team: "TOR", position: "RHS" }}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    expect(onFilterChange).toHaveBeenCalledWith({});
  });
});
