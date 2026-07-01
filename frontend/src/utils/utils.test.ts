import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { getAge } from "./utils";

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
