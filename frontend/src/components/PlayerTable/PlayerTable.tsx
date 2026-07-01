import React from "react";
import { Player } from "../../types";
import { getAge } from "../../utils";
import styles from "./playerTable.styles.module.css";

interface PlayerTableProps {
  players: Player[];
  isLoading?: boolean;
  error?: string;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  isLoading = false,
  error,
}) => {

  // TODO: @bsoni Add a click handler to navigate to the player details page when a player's name is clicked
  const handlePlayerClick = (playerId: number) => {}

  if (isLoading) {
    return (
      <div className={styles.playerTable}>
        <div className={styles.loading} role="status">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.playerTable}>
        <div className={styles.error} role="alert">Error: {error}</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className={styles.playerTable}>
        <div className={styles.noData} role="status">No players found.</div>
      </div>
    );
  }

  return (
    <div className={styles.playerTable}>
      <h2 id="player-table-heading">Players ({players.length} players)</h2>

      <div className="table-container">
        <table aria-labelledby="player-table-heading">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Team</th>
              <th scope="col">Position</th>
              <th scope="col">Bats</th>
              <th scope="col">Throws</th>
              <th scope="col">Age</th>
              <th scope="col">Height</th>
              <th scope="col">Weight</th>
              <th scope="col">Birth Place</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.player_id}
                data-testid={`player-row-${player.player_id}`}
                className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
              >
                <td className={styles.playerName} role="button" tabIndex={0} onClick={()=>handlePlayerClick(player.player_id)}>
                  {player.first_name} {player.last_name}
                  </td>
                <td className={styles.teamName}>{player.team}</td>
                <td>{player.primary_position}</td>
                <td>{player.bats}</td>
                <td>{player.throws}</td>
                <td>{getAge(player.birthdate)}</td>
                <td>{player.height_feet}' {player.height_inches}"</td>
                <td>{player.weight} lbs</td>
                <td>{player.birth_state === "NULL" ? "" : `${player.birth_state}, `}{player.birth_country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TODO: Add table features if time permits */}
      {/* Consider adding:
          - Sorting by column headers
          - Pagination for large datasets
          - Row highlighting on hover
          - Click to view player details
      */}
    </div>
  );
};

export default PlayerTable;
