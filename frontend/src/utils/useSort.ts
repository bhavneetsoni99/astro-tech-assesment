import { useCallback, useMemo } from "react";
import { TableRow, SortConfig, SortDirection } from "../types";
import {useFilterParams}from './useFilterParams'

export function useSort() {
  const  { selectedFilters, setFilters } = useFilterParams()
   const sortConfig = useMemo<SortConfig>(() => {
    const { columnIndex, direction } = selectedFilters;
    if (columnIndex !== undefined && direction) {
      return {
        columnIndex: Number(columnIndex),
        direction: direction as SortDirection
      };
    }
    return { columnIndex: null, direction: null };
  }, [selectedFilters]);


const handleSort = useCallback((columnIndex: number) => {
    let nextConfig: SortConfig = { columnIndex: null, direction: null };

    if (sortConfig.columnIndex !== columnIndex) {
      nextConfig = { columnIndex, direction: "asc" };
    } else if (sortConfig.direction === "asc") {
      nextConfig = { columnIndex, direction: "desc" };
    }
    setFilters((prev)=>({
      ...prev,
      columnIndex: nextConfig.columnIndex,
      direction: nextConfig.direction,
    }))
  }, [sortConfig, setFilters]);

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

  return { handleSort, sortData, sortConfig };
}
