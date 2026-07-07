import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableComponent } from "./TableComponent";
import { TableRow } from "../../types";

const mockColumns = ["Name", "Team", "Position"];
const mockData: TableRow[] = [
  { id: 1, cells: ["Player A", "TOR", "RHS"] },
  { id: 2, cells: ["Player B", "SD", "LHS"] },
];

describe("TableComponent", () => {
  test("renders column headers", () => {
    render(
      <TableComponent tableName="players" columns={mockColumns} data={mockData} />
    );
    mockColumns.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test("renders data rows with test ids", () => {
    render(
      <TableComponent tableName="players" columns={mockColumns} data={mockData} />
    );
    expect(screen.getByTestId("row-1")).toBeInTheDocument();
    expect(screen.getByTestId("row-2")).toBeInTheDocument();
  });

  test("shows error state instead of table", () => {
    render(
      <TableComponent tableName="players" columns={mockColumns} data={mockData} error="Failed to load" />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Error: Failed to load");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("shows loading spinner when isLoading is true", () => {
    const { container } = render(
      <TableComponent tableName="players" columns={mockColumns} data={[]} isLoading={true} />
    );
    const spinnerOverlay = container.querySelector('[class*="loadingOverlay"]');
    expect(spinnerOverlay).toBeInTheDocument();
  });

  test("shows no data message when data is empty", () => {
    render(
      <TableComponent tableName="players" columns={mockColumns} data={[]} />
    );
    expect(screen.getByText("No players found.")).toBeInTheDocument();
  });

  test("shows plural heading for pitches", () => {
    render(
      <TableComponent tableName="pitches" columns={mockColumns} data={mockData} />
    );
    expect(screen.getByText("2 Pitches")).toBeInTheDocument();
  });

  test("renders correct number of rows", () => {
    const { container } = render(
      <TableComponent tableName="players" columns={mockColumns} data={mockData} />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });

  test("Row is clickable when onRowClick is provided", () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <TableComponent tableName="players" columns={mockColumns} data={mockData} onRowClick={onRowClick}/>
    );
    const firstDataRow = container.querySelectorAll("tbody tr")[0];

    fireEvent.click(firstDataRow);
    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  describe("sorting", () => {
    test("clicking a column header calls onSort with column index", () => {
      const onSort = vi.fn();
      render(
        <TableComponent tableName="players" columns={mockColumns} data={mockData} onSort={onSort} />
      );
      fireEvent.click(screen.getByText("Team"));
      expect(onSort).toHaveBeenCalledWith(1);
    });

    test("shows sort indicator on active sort column", () => {
      const { container } = render(
        <TableComponent
          tableName="players"
          columns={mockColumns}
          data={mockData}
          sortColumn={1}
          sortDirection="asc"
          onSort={vi.fn()}
        />
      );
      const headerCells = container.querySelectorAll("th");
      expect(headerCells[1].textContent).toContain("▲");
    });

    test("shows descending indicator when sort direction is desc", () => {
      const { container } = render(
        <TableComponent
          tableName="players"
          columns={mockColumns}
          data={mockData}
          sortColumn={1}
          sortDirection="desc"
          onSort={vi.fn()}
        />
      );
      const headerCells = container.querySelectorAll("th");
      expect(headerCells[1].textContent).toContain("▼");
    });

    test("sets aria-sort attribute on active column", () => {
      render(
        <TableComponent
          tableName="players"
          columns={mockColumns}
          data={mockData}
          sortColumn={1}
          sortDirection="asc"
          onSort={vi.fn()}
        />
      );
      const headerCells = screen.getAllByRole("columnheader");
      expect(headerCells[1]).toHaveAttribute("aria-sort", "ascending");
    });

    test("header is keyboard accessible with Enter key", () => {
      const onSort = vi.fn();
      render(
        <TableComponent tableName="players" columns={mockColumns} data={mockData} onSort={onSort} />
      );
      const headerCells = screen.getAllByRole("columnheader");
      fireEvent.keyDown(headerCells[0], { key: "Enter" });
      expect(onSort).toHaveBeenCalledWith(0);
    });

    test("non-active column has no sort indicator", () => {
      const { container } = render(
        <TableComponent
          tableName="players"
          columns={mockColumns}
          data={mockData}
          sortColumn={0}
          sortDirection="asc"
          onSort={vi.fn()}
        />
      );
      const headerCells = container.querySelectorAll("th");
      expect(headerCells[1].textContent).not.toContain("▲");
      expect(headerCells[1].textContent).not.toContain("▼");
    });
  });
});
