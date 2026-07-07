import React, {useEffect, useState } from "react";
import ApiService from "../../services/api";
import { PlayerFilterOptions } from "../../types";
import PlayerFilterControls from "./PlayerFilterControls";

interface PlayerTableWrapperProps {
 filters?: PlayerFilterOptions;
 onFilterChange: React.Dispatch<React.SetStateAction<PlayerFilterOptions>>
}

interface PlayerFilterState {
  availablePositions?: string[]
  availableTeams?: string[]
} 

export const PlayerFilterWrapper: React.FC<PlayerTableWrapperProps> = ({
  filters = {},
  onFilterChange
}) => {
  const [filterData, setfilterData] = useState<PlayerFilterState>({});

    useEffect(() => {
      Promise.all([
        ApiService.getPositions(),
         ApiService.getTeams()
        ]).then(([availablePositions, availableTeams])=> {
          setfilterData({availablePositions, availableTeams})
         }).catch((_error) => {
            setfilterData({});
          })
    }, []);
  
    const { availablePositions = [], availableTeams = []} = filterData 
  

  return (
    <PlayerFilterControls 
      filters={filters} 
      availableTeams={availableTeams} 
      availablePositions={availablePositions}
      onFilterChange={onFilterChange}  
    />
  );
}