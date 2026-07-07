import { useState, useCallback } from "react";
import { TableRow } from "../types";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  columnIndex: number | null;
  direction: SortDirection;
}

export function useSort(initial?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initial ?? { columnIndex: null, direction: null }
  );

  const handleSort = useCallback((columnIndex: number) => {
    setSortConfig((prev) => {
      if (prev.columnIndex !== columnIndex) {
        return { columnIndex, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnIndex, direction: "desc" };
      }
      return { columnIndex: null, direction: null };
    });
  }, []);

  const sortData = useCallback(
    (data: TableRow[]): TableRow[] => {
      if (sortConfig.columnIndex === null || sortConfig.direction === null) {
        return data;
      }
      return [...data].sort((a, b) => {
        const aVal = a.cells[sortConfig.columnIndex!] ?? "";
        const bVal = b.cells[sortConfig.columnIndex!] ?? "";
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        const numeric = !isNaN(aNum) && !isNaN(bNum);
        const comparison = numeric
          ? aNum - bNum
          : aVal.localeCompare(bVal);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    },
    [sortConfig]
  );

  return { sortConfig, handleSort, sortData };
}
