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

  describe("getTeams", () => {
    test("calls GET /teams and returns team names", async () => {
      const teams = ["TOR", "SD", "LAD"];
      mockGet.mockResolvedValue({ data: teams });

      const result = await ApiService.getTeams();

      expect(mockGet).toHaveBeenCalledWith("/teams");
      expect(result).toEqual(teams);
    });
  });

  describe("getPositions", () => {
    test("calls GET /positions and returns position names", async () => {
      const positions = ["1B", "2B", "LAD"];
      mockGet.mockResolvedValue({ data: positions });

      const result = await ApiService.getPositions();

      expect(mockGet).toHaveBeenCalledWith("/positions");
      expect(result).toEqual(positions);
    });
  });

  describe("healthCheck", () => {
    test("calls GET /health and returns status", async () => {
      const health = { status: "healthy" };
      mockGet.mockResolvedValue({ data: health, status: 200 });

      const result = await ApiService.healthCheck();

      expect(mockGet).toHaveBeenCalledWith("/health");
      expect(result.data).toEqual(health);
    });
  });
});
