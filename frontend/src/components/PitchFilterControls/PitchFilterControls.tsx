import React, { useState, useEffect } from "react";
import { FilterOptions, PitchFilterOptions, PlayerInfo } from "../../types";
import styles from "./pitchFilterControls.styles.module.css";

interface PitchFilterControlsProps {
  availablePitchNames: string[];
  availablePlayers: PlayerInfo[];
  availableTeams: string[];
  filters?: PitchFilterOptions;
  onFilterChange: (filters: FilterOptions) => void
}

const PitchFilterControls: React.FC<PitchFilterControlsProps> = ({
  availablePitchNames = [],
  availablePlayers = [],
  availableTeams=[],
  filters = {},
  onFilterChange,
}) => {
  const [speed, setSpeed] = useState(filters.release_speed || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, release_speed: speed})
    }, 500)

    return () => clearTimeout(timer);
  }, [speed, filters, onFilterChange]);

  return (
      <fieldset className={styles.filterControls} aria-label="Pitch filters">
        <legend>Filter Pitches</legend>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="pitch-name-filter">Pitch Type</label>
            <select
              id="pitch-name-filter"
              value={filters.pitch_name || ""}
              onChange={(event) =>
                onFilterChange({ ...filters, pitch_name: event?.target?.value || '' })}
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
                onFilterChange({
                  ...filters,
                  pitcher: Number(event.target.value) || undefined
                })
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
                onFilterChange({
                  ...filters,
                  pitching_team: event.target.value || undefined
                })
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
                onFilterChange({
                  ...filters,
                  batter: Number(event.target.value) || undefined
                })
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
                onFilterChange({
                  ...filters,
                  batting_team: event.target.value || undefined
                })
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
              placeholder="Pitches faster than..."
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            />
          </div>

          <button type="button" onClick={() => {setSpeed(''); onFilterChange({})}} className={styles.clearFilters}>
            Clear Filters
          </button>
        </div>
      </fieldset>
  );
};

export default PitchFilterControls;
