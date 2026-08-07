import React from "react";

import { PitchTable } from "../PitchTable";
import { PitchFilterWrapper } from "../PitchFilterControls";

export const PitchesComponent: React.FC = () => {
  return (<>
            <PitchFilterWrapper />
            <PitchTable/>
          </>
        )
}