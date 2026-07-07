import React from "react";
import { PitchFilterOptions, PlayerInfo } from "../../types";
import styles from "./pitchFilterControls.styles.module.css";

interface PitchFilterControlsProps {
  availablePitchNames: string[];
  availablePlayers: PlayerInfo[];
  availableTeams: string[];
  filters?: PitchFilterOptions;
  onFilterChange: React.Dispatch<React.SetStateAction<PitchFilterOptions>>
}

const PitchFilterControls: React.FC<PitchFilterControlsProps> = ({
  availablePitchNames = [],
  availablePlayers = [],
  availableTeams=[],
  filters = {},
  onFilterChange,
}) => {

  return (
    <section className={styles.filterControls} aria-label="Pitch filters">
      <fieldset>
        <legend>Filter Pitches</legend>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="pitch-name-filter">Pitch Type</label>
            <select
              id="pitch-name-filter"
              value={filters.pitch_name || ""}
              onChange={(event) =>
                onFilterChange((prevFilters: PitchFilterOptions) =>
                  ({ ...prevFilters, pitch_name: event?.target?.value || '' }))}
            >
              <option value="">All Pitches</option>
              {availablePitchNames.map((pitchName) => (
                <option key={pitchName} value={pitchName}>
                  {pitchName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="pitcher-filter">Pitcher</label>
            <select
              id="pitcher-filter"
              value={filters.pitcher || ""}
              onChange={(event) =>
                onFilterChange((prev: PitchFilterOptions) => ({
                  ...prev,
                  pitcher: Number(event.target.value) || undefined
                }))
              }
            >
              <option value="">All Pitchers</option>
              {availablePlayers.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="pitching-team-filter">Pitching Team</label>
            <select
              id="pitching-team-filter"
              value={filters.pitching_team || ""}
              onChange={(event) =>
                onFilterChange((prev: PitchFilterOptions) => ({
                  ...prev,
                  pitching_team: event.target.value || undefined
                }))
              }
            >
              <option value="">All Teams</option>
              {availableTeams.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="batter-filter">Batter</label>
            <select
              id="batter-filter"
              value={filters.batter || ""}
              onChange={(event) =>
                onFilterChange((prev: PitchFilterOptions) => ({
                  ...prev,
                  batter: Number(event.target.value) || undefined
                }))
              }
            >
              <option value="">All Batters</option>
              {availablePlayers.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="batting-team-filter">Batting Team</label>
            <select
              id="batting-team-filter"
              value={filters.batting_team || ""}
              onChange={(event) =>
                onFilterChange((prev: PitchFilterOptions) => ({
                  ...prev,
                  batting_team: event.target.value || undefined
                }))
              }
            >
              <option value="">All Teams</option>
              {availableTeams.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="speed-filter">Speed</label>
            <input
              type="text"
              id="speed-filter"
              value={filters.release_speed || ""}
              onChange={(event) =>
                onFilterChange((prevFilters: PitchFilterOptions) =>
                  ({ ...prevFilters, release_speed: event.target.value }))}
            />
          </div>

          <button type="button" onClick={() => onFilterChange({})} className={styles.clearFilters}>
            Clear Filters
          </button>
        </div>
      </fieldset>
    </section>
  );
};

export default PitchFilterControls;
