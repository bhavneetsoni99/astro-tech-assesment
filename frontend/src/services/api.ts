import axios from "axios";
import { Player, PlayerFilterOptions, PlayerInfo, PitchFilterOptions, PitchesResponse, type ApiErrorResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    const status = error.response?.status || 0;
    return Promise.reject({ message, status } satisfies ApiErrorResponse);
  }
);

export class ApiService {
  /**
   * Get all players or filter by team/position
   */
  static async getPlayers(filters?: PlayerFilterOptions): Promise<Player[]> {
    const response = await api.get("/players", { params: filters });
    const players: Player[] = response.data;
    return players;
  }

  static async getTeams(): Promise<string[]> {
    const response = await api.get("/teams");
    const teamNames: string[] = response.data;
    return teamNames;
  }

  static async getPositions(): Promise<string[]> {
    const response = await api.get("/positions");
    const positionNames: string[] = response.data;
    return positionNames;
  }

  static async getPlayersList(): Promise<PlayerInfo[]> {
    const response = await api.get("/players_list");
    const playersList: PlayerInfo[] = response.data;
    return playersList;
  }

  static async getPitchNames(): Promise<string[]> {
    const response = await api.get("/pitch_names");
    const pitchTypes: string[] = response.data;
    return pitchTypes;
  }

  static async getPitches(filters?: PitchFilterOptions): Promise<PitchesResponse>{
    const response = await api.get("/pitches", { params: filters });
    return response.data;
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string }> {
    return api.get("/health");
  }
}

export default ApiService;
