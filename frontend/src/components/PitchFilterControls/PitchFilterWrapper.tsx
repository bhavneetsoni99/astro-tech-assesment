import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { PlayerInfo } from "../../types";
import PitchFilterControls from "./PitchFilterControls";
import {useFilterParams} from '../../utils'


interface PitchFilterState {
  availablePlayers?: PlayerInfo[]
  availablePitchNames?: string[]
  availableTeams?: string[]
} 

export const PitchFilterWrapper: React.FC = () => {
  const [filterData, setfilterData] = useState<PitchFilterState>({});
  const { selectedFilters, setFilters} = useFilterParams();
  
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
      filters={selectedFilters}
      availablePlayers={availablePlayers}
      availablePitchNames={availablePitchNames}
      availableTeams={availableTeams}
      onFilterChange={setFilters}
    />
  );
}