export interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  birth_country: string | null;
  birth_state: string | null;
  team: string;
  primary_position: string;
  throws: 'L' | 'R'; 
  bats: 'L' | 'R' | 'S';
  height_feet: number;
  height_inches: number;
  weight: number;
}

export interface Pitch {
  rowid: number;
  pitch_type: string;
  pitch_name: string;
  release_speed: string;
  type: string;
  batter: number;
  batter_details: {
    first_name: string;
    last_name: string;
    team: string;
  };
  pitcher: number;
  pitcher_details: {
    first_name: string;
    last_name: string;
    team: string;
  };
  description: string;
  events: string;
  game_date: string;
}

export interface PlayerFilterOptions {
  team?: string;
  position?: string;
  throws?: string
  bats?: string
}

export interface TableRow {
  id: number | string;
  cells: string[];
}

export interface PitchFilterOptions {
  release_speed?: string;
  pitcher?: number;
  pitching_team?: string;
  batter?: number;
  batting_team?: string;
  pitch_name?: string;
  next_cursor?: number | null;
  limit?: number;
}

export interface PlayerInfo {
  player_id: number;
  first_name: string;
  last_name: string;
}

export interface PitchesResponse {
  pitches: Pitch[];
  total_count: number;
  next_cursor: number | null;
  limit: number;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  columnIndex?: number | null;
  direction?: SortDirection;
}

export type FilterOptions = (PlayerFilterOptions | PitchFilterOptions) & SortConfig