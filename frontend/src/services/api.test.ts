import { describe, test, expect, vi, beforeEach } from "vitest";
import { ApiService } from "./api";

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      interceptors: {
        response: { use: vi.fn() },
      },
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

  describe("getPitchNames", () => {
    test("calls GET /pitch-types and returns pitch types", async () => {
      const pitchNames = ["FF", "SL", "CH"];
      mockGet.mockResolvedValue({ data: pitchNames });

      const result = await ApiService.getPitchNames();

      expect(mockGet).toHaveBeenCalledWith("/pitch_names");
      expect(result).toEqual(pitchNames);
    });
  });

  describe("getPitches", () => {
    test("calls GET /pitches and returns pitches response", async () => {
      const pitchResponse = {
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
        ],
        total_count: 1,
        next_cursor: null,
        limit: 1000,
      };
      mockGet.mockResolvedValue({ data: pitchResponse });

      const result = await ApiService.getPitches();

      expect(mockGet).toHaveBeenCalledWith("/pitches", {
        params: undefined,
      });
      expect(result).toEqual(pitchResponse);
    });

    test("passes filters as query params", async () => {
      mockGet.mockResolvedValue({ data: { pitches: [], total_count: 0, next_cursor: null, limit: 1000 } });

      await ApiService.getPitches({ pitcher: 453286, pitch_name: "Fastball", release_speed: "90" });

      expect(mockGet).toHaveBeenCalledWith("/pitches", {
        params: { pitcher: 453286, pitch_name: "Fastball", release_speed: "90" },
      });
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
