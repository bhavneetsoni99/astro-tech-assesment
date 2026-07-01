import { describe, test, expect, vi, beforeEach } from "vitest";
import { ApiService } from "./api";

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
    })),
  },
}));



beforeEach(() => {
  mockGet.mockReset();
});

describe("ApiService", () => {
  describe("getPlayers", () => {
    test("calls GET /players and returns players", async () => {
      const players = [
        { player_id: 1, first_name: "Max", last_name: "Scherzer", team: "TOR" },
      ];
      mockGet.mockResolvedValue({ data: players });

      const result = await ApiService.getPlayers();

      expect(mockGet).toHaveBeenCalledWith("/players", {
        params: undefined,
      });
      expect(result).toEqual(players);
    });

    test("passes filters as query params", async () => {
      mockGet.mockResolvedValue({ data: [] });

      await ApiService.getPlayers({ team: "TOR", position: "RHS" });

      expect(mockGet).toHaveBeenCalledWith("/players", {
        params: { team: "TOR", position: "RHS" },
      });
    });
  });
});
