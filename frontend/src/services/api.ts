import axios from "axios";
import { Player, PlayerFilterOptions } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

  // TODO: add additional endpoint calls as needed.

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string }> {
    return api.get("/health");
  }
}

export default ApiService;
