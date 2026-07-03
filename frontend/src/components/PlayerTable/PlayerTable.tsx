import React, {useEffect, useMemo, useState} from "react";
import ApiService from "../../services/api";
import { Player, PlayerFilterOptions, TableRow } from "../../types";
import {TableComponent} from "../TableComponent";
import { getAge } from "../../utils";

interface PlayerTableProps {
 filters?: PlayerFilterOptions;
}

const PLAYER_COLUMNS = ['Name', 'Team', 'Position', 'Bats', 'Throws', 'Age', 'Height', 'Weight', 'Birth Place']

export const PlayerTable: React.FC<PlayerTableProps> = ({
  filters = {},
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const {team, position} = filters;

  useEffect(() => {
    setIsLoading(true);
    setError("");
    ApiService.getPlayers({team, position})
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [team, position]);

  const rows = useMemo(() => players.map((player) => ({
    id: player.player_id,
    cells: [
      player.first_name + " " + player.last_name,
      player.team,
      player.primary_position,
      player.bats,
      player.throws,
      getAge(player.birthdate),
      `${player.height_feet}' ${player.height_inches}"`,
      `${player.weight} lbs`,
      `${player.birth_state === "NULL" ? "" : `${player.birth_state}, `}${player.birth_country}`
    ]
  } as TableRow)), [players]);

  return (
    <TableComponent
      tableName="players"
      columns={PLAYER_COLUMNS}
      data={rows}
      isLoading={isLoading}
      error={error}
      onRowClick={(rowId) => {
        const player = players.find(p => p.player_id === rowId);
        if (player) {
          // TODO: Implement navigation to player details page, e.g., using React Router's useNavigate
        }
      }}
    />
  );
};