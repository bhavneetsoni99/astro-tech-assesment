import React, {useEffect, useState } from "react";
import ApiService from "../../services/api";
import { PlayerFilterOptions } from "../../types";
import PlayerFilterControls from "./PlayerFilterControls";

interface PlayerTableWrapperProps {
 filters?: PlayerFilterOptions;
 onFilterChange: React.Dispatch<React.SetStateAction<PlayerFilterOptions>>
}

export const PlayerFilterWrapper: React.FC<PlayerTableWrapperProps> = ({
  filters = {},
  onFilterChange
}) => {
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  useEffect(() => {
    ApiService.getTeams().then((teams) => {
      setAvailableTeams(teams);
    }).catch((error) => {
      setAvailableTeams([]);
    })
    ApiService.getPositions().then((positions) => {
      setAvailablePositions(positions);
    }).catch((error) => {
      setAvailablePositions([]);
    })
  }, []);

  return (
    <PlayerFilterControls 
      filters={filters} 
      availableTeams={availableTeams} 
      availablePositions={availablePositions}
      onFilterChange={onFilterChange}  
    />
  );
}