import React, {useEffect, useState} from "react";
import ApiService from "../../services/api";
import { Player, PlayerFilterOptions } from "../../types";
import PlayerTable from "./PlayerTable";

interface PlayerTableWrapperProps {
 filters?: PlayerFilterOptions;
}

export const PlayerTableWrapper: React.FC<PlayerTableWrapperProps> = ({
  filters = {},
}) => {
  // TODO: Housekeeping extract to a custom hook for fetching players and managing loading/error state
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    ApiService.getPlayers(filters)
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [filters]);

  return (
    <PlayerTable players={players} isLoading={isLoading} error={error} />
  );
}