import React, { useState } from "react";
import { PitchFilterOptions } from "../../types";
import { PitchTable } from "../PitchTable";
import { PitchFilterWrapper } from "../PitchFilterControls";

export const PitchesComponent: React.FC = () => {
  const [pitchFilters, setPitchFilters] = useState<PitchFilterOptions>({});

  return (<>
            <PitchFilterWrapper
              onFilterChange={setPitchFilters}
              filters={pitchFilters}
            />
            <PitchTable filters={pitchFilters} />
          </>
        )
}