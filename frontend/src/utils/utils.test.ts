import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { getAge } from "./utils";
import { useSort } from "./useSort";

describe("getAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns correct age when birthday has passed this year", () => {
    vi.setSystemTime(new Date("2024-06-15"));
    expect(getAge("1990-01-01")).toBe(34);
  });

  test("returns correct age when birthday is later this year", () => {
    vi.setSystemTime(new Date("2024-06-15"));
    expect(getAge("1990-12-31")).toBe(33);
  });
});

describe("useSort", () => {
  test("handleSort sets ascending on first click", () => {
    const { result } = renderHook(() => useSort());
    act(() => result.current.handleSort(2));
    expect(result.current.sortConfig.columnIndex).toBe(2);
    expect(result.current.sortConfig.direction).toBe("asc");
  });

  test("handleSort toggles to descending on second click", () => {
    const { result } = renderHook(() => useSort());
    act(() => result.current.handleSort(2));
    act(() => result.current.handleSort(2));
    expect(result.current.sortConfig.columnIndex).toBe(2);
    expect(result.current.sortConfig.direction).toBe("desc");
  });

  test("sortData sorts strings alphabetically descending", () => {
    const { result } = renderHook(() => useSort());
    act(() => result.current.handleSort(0));
    act(() => result.current.handleSort(0));
    const data = [
      { id: 1, cells: ["banana"] },
      { id: 2, cells: ["apple"] },
      { id: 3, cells: ["cherry"] },
    ];
    const sorted = result.current.sortData(data);
    expect(sorted[0].cells[0]).toBe("cherry");
    expect(sorted[1].cells[0]).toBe("banana");
    expect(sorted[2].cells[0]).toBe("apple");
  });

  test("sortData sorts numbers numerically", () => {
    const { result } = renderHook(() => useSort());
    act(() => result.current.handleSort(0));
    const data = [
      { id: 1, cells: ["100"] },
      { id: 2, cells: ["20"] },
      { id: 3, cells: ["3"] },
    ];
    const sorted = result.current.sortData(data);
    expect(sorted[0].cells[0]).toBe("3");
    expect(sorted[1].cells[0]).toBe("20");
    expect(sorted[2].cells[0]).toBe("100");
  });
});
