import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { PitchFilterOptions, PlayerInfo } from "../../types";
import PitchFilterControls from "./PitchFilterControls";

interface PitchTableWrapperProps {
  filters?: PitchFilterOptions;
  onFilterChange: React.Dispatch<React.SetStateAction<PitchFilterOptions>>
}

interface PitchFilterState {
  availablePlayers?: PlayerInfo[]
  availablePitchNames?: string[]
  availableTeams?: string[]
} 

export const PitchFilterWrapper: React.FC<PitchTableWrapperProps> = ({
  filters = {},
  onFilterChange
}) => {
  const [filterData, setfilterData] = useState<PitchFilterState>({});
  
  useEffect(() => {
    Promise.all([
      ApiService.getPitchNames(),
      ApiService.getPlayersList(),
      ApiService.getTeams()
    ]).then(([availablePitchNames, availablePlayers, availableTeams])=> {
        setfilterData({availablePitchNames, availablePlayers, availableTeams})
       }).catch((_error) => {
          setfilterData({});
        })
  }, []);

  const {availablePlayers = [], availablePitchNames = [], availableTeams = []} = filterData 

  return (
    <PitchFilterControls
      filters={filters}
      availablePlayers={availablePlayers}
      availablePitchNames={availablePitchNames}
      availableTeams={availableTeams}
      onFilterChange={onFilterChange}
    />
  );
}