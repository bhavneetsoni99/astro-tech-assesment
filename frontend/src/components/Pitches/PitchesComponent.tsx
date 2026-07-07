import React, { useState } from "react";
import styles from "../../styles/styles.module.css";
import { PitchFilterOptions } from "../../types";
import { PitchTable } from "../PitchTable";
import { PitchFilterWrapper } from "../PitchFilterControls";

export const PitchesComponent: React.FC = () => {
  const [pitchFilters, setPitchFilters] = useState<PitchFilterOptions>({});

  return (<>
            <section className={styles.filterSection}>
              <PitchFilterWrapper
                onFilterChange={setPitchFilters}
                filters={pitchFilters}
              />
            </section>

            <section className={styles.dataSection}>
              <PitchTable filters={pitchFilters} />
            </section>
        </>)
}