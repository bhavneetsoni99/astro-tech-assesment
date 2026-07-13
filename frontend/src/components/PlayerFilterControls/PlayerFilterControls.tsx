import React from "react";
import { PlayerFilterOptions, FilterOptions } from "../../types";
import styles from "./playerFilterControls.styles.module.css";

interface PlayerFilterControlsProps {
  availableTeams: string[];
  availablePositions: string[];
  filters?: PlayerFilterOptions;
  onFilterChange: (filters: FilterOptions) => void
}

const BATTING_HAND = ['L', 'R', 'S']
const THROWING_HAND = ['L', 'R']


const PlayerFilterControls: React.FC<PlayerFilterControlsProps> = ({
  availableTeams = [],
  availablePositions = [],
  filters = {},
  onFilterChange,
}) => {

  return (
      <fieldset className={styles.filterControls} aria-label="Player filters">
        <legend>Filter Players</legend>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="team-filter">Team</label>
            <select
              id="team-filter"
              value={filters.team || ""}
              onChange={(event) =>
                onFilterChange({ ...filters, team: event?.target?.value || '' })}
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
              onChange={(event) => onFilterChange({ ...filters, position: event.target.value })}
            >
              <option value="">All Positions</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="throws-filter">Throws</label>
            <select
              id="throws-filter"
              value={filters.throws || ""}
              onChange={(event) => onFilterChange({ ...filters, throws: event.target.value })}
            >
              <option value="">All</option>
              {THROWING_HAND.map((hand) => (
                <option key={hand} value={hand}>
                  {hand}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="batting-hand-filter">Bats</label>
            <select
              id="batting-hand-filter"
              value={filters.bats || ""}
              onChange={(event) => onFilterChange({ ...filters, bats: event.target.value })}
            >
              <option value="">All</option>
              {BATTING_HAND.map((hand) => (
                <option key={hand} value={hand}>
                  {hand}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={() => onFilterChange({})} className={styles.clearFilters}>
            Clear Filters
          </button>
        </div>
      </fieldset>
  );
};

export default PlayerFilterControls;
