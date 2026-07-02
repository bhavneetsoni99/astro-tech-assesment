import React from "react";
import { PlayerFilterOptions } from "../../types";
import styles from "./playerFilterControls.styles.module.css";

interface PlayerFilterControlsProps {
  availableTeams: string[];
  availablePositions: string[];
  filters?: PlayerFilterOptions;
  onFilterChange: React.Dispatch<React.SetStateAction<PlayerFilterOptions>>
}


const PlayerFilterControls: React.FC<PlayerFilterControlsProps> = ({
  availableTeams = [],
  availablePositions = [],
  filters = {},
  onFilterChange,
}) => {

  return (
    <section className={styles.filterControls} aria-label="Player filters">
      <fieldset>
        <legend>Filter Players</legend>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="team-filter">Team</label>
            <select
              id="team-filter"
              value={filters.team || ""}
              onChange={(event)=> onFilterChange((prevFilters: PlayerFilterOptions) => ({ ...prevFilters, team: event?.target?.value || ''}))}
            >
              <option value="">All Teams</option>
              {availableTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="position-filter">Position</label>
            <select
              id="position-filter"
              value={filters.position || ""}
              onChange={(event)=> onFilterChange({ ...filters, position: event.target.value })}
            >
              <option value="">All Positions</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}  
                  </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={() => onFilterChange({})} className={styles.clearFilters}>
            Clear Filters
          </button>
        </div>
      </fieldset>
    </section>
  );
};

export default PlayerFilterControls;
