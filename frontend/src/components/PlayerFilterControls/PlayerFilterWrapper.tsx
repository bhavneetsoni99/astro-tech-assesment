import React, {useEffect, useState } from "react";
import ApiService from "../../services/api";
import PlayerFilterControls from "./PlayerFilterControls";
import {useFilterParams} from '../../utils'


interface PlayerFilterState {
  availablePositions?: string[]
  availableTeams?: string[]
} 

export const PlayerFilterWrapper: React.FC = () => {
  const [filterData, setfilterData] = useState<PlayerFilterState>({});
  const { selectedFilters, setFilters} = useFilterParams();
  
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
      filters={selectedFilters} 
      availableTeams={availableTeams} 
      availablePositions={availablePositions}
      onFilterChange={setFilters}  
    />
  );
}