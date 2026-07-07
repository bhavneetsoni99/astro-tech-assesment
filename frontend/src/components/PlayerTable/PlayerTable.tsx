import React, {useEffect, useMemo, useState} from "react";
import { useNavigate } from 'react-router-dom';
import ApiService from "../../services/api";
import { Player, PlayerFilterOptions, TableRow } from "../../types";
import {TableComponent} from "../TableComponent";
import { getAge, useSort } from "../../utils";

interface PlayerTableProps {
 filters?: PlayerFilterOptions;
}

const PLAYER_COLUMNS = ['Name', 'Team', 'Position', 'Bats', 'Throws', 'Age', 'Height', 'Weight', 'Birth Place']

export const PlayerTable: React.FC<PlayerTableProps> = ({
  filters = {},
}) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const {team, position, throws, bats} = filters;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError("");
    ApiService.getPlayers({team, position, throws, bats})
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [team, position, throws, bats]);

  const rows = useMemo(() => players.map((player) => ({
    id: player.player_id,
    cells: [
      player.first_name + " " + player.last_name,
      player.team,
      player.primary_position,
      player.bats,
      player.throws,
      String(getAge(player.birthdate)),
      `${player.height_feet}' ${player.height_inches}"`,
      `${player.weight} lbs`,
      `${player.birth_state === "NULL" ? "" : `${player.birth_state}, `}${player.birth_country}`
    ]
  } as TableRow)), [players]);

  const { sortConfig, handleSort, sortData } = useSort();
  const sortedRows = useMemo(() => sortData(rows), [rows, sortData]);

  return (
    <TableComponent
      tableName="players"
      columns={PLAYER_COLUMNS}
      data={sortedRows}
      isLoading={isLoading}
      error={error}
      onRowClick={(rowId) => {
        const player = players.find(p => p.player_id === rowId);
        if (player) {
          navigate(`/player-details/${rowId}`);
        }
      }}
      sortColumn={sortConfig.columnIndex}
      sortDirection={sortConfig.direction}
      onSort={handleSort}
    />
  );
};