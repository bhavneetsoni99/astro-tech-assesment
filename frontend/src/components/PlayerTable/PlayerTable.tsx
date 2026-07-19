import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ApiService from "../../services/api";
import { Player, TableRow } from "../../types";
import { TableComponent } from "../TableComponent";
import { getAge, useSort, useFilterParams, triggerDownload } from "../../utils";
import type { SortDirection } from "../../types";


// coloumn name and classname to adjust width
const PLAYER_COLUMNS = [['Name', 'colFlex'], ['Team', 'colSmall'],
['Pos', 'colSmall'], ['Bat', 'colSmall'], ['Thw', 'colSmall'],
['Age', 'colSmall'], ['Ht', 'colSmall'], ['Wt', 'colMedium'],
['Birth Place', 'colFlex']]

interface PlayerTableProps {
  filters?: Record<string, string>;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({ filters: propFilters }) => {
  const navigate = useNavigate();
  const {selectedFilters: urlFilters} = useFilterParams();
  const selectedFilters = propFilters ?? urlFilters;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { team, position, throws, bats, columnIndex, direction } = selectedFilters;

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
      `${player.first_name?.charAt(0)}. ${player.last_name}`,
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

  const { handleSort, sortData } = useSort();
  const sortedRows = useMemo(() => sortData(rows), [rows, sortData]);

  const handleDownloadCSV = useCallback(async () => {
    try {
      const blob = await ApiService.downloadPlayersCSV({team, position, throws, bats});
      triggerDownload(blob, "players.csv");
    } catch {
      setError("Failed to download CSV");
    }
  }, [team, position, throws, bats]);

  const handleRowClick = useCallback((rowId: number | string) => {
    const player = players.find(p => p.player_id === rowId);
    if (player) {
      navigate(`/player-details/${rowId}`);
    }
  }, [players, navigate]);

  return (
      <TableComponent
        tableName="players"
        columns={PLAYER_COLUMNS}
        data={sortedRows}
        isLoading={isLoading}
        error={error}
        onRowClick={handleRowClick}
        sortColumn={columnIndex !== undefined ? Number(columnIndex) : null}
        sortDirection={(direction as SortDirection) ?? null}
        onSort={handleSort}
        handleDownlad={handleDownloadCSV}
      />
  );
};