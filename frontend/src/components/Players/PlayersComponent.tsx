import React, { useState } from "react";
import { PlayerFilterOptions } from "../../types";
import { PlayerFilterWrapper } from "../PlayerFilterControls";
import { PlayerTable } from "../PlayerTable";

export const PlayersComponent: React.FC = () => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  return (<>
            <PlayerFilterWrapper
              onFilterChange={setFilters}
              filters={filters}
            />
            <PlayerTable filters={filters} />
        </>)
}