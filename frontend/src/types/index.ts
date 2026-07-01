// TODO: Define TypeScript interfaces for your data types here

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
  // TODO: Add player properties that match your backend model
}

export interface PlayerFilterOptions {
  team?: string;
  position?: string;
}
