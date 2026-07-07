import React, { useState } from "react";
import styles from "../../styles/styles.module.css";
import { PlayerFilterOptions } from "../../types";
import { PlayerFilterWrapper } from "../PlayerFilterControls";
import { PlayerTable } from "../PlayerTable";

export const PlayersComponent: React.FC = () => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  return (<>
            <section className={styles.filterSection}>
              <PlayerFilterWrapper
                onFilterChange={setFilters}
                filters={filters}
              />
            </section>

            <section className={styles.dataSection}>
              <PlayerTable filters={filters} />
            </section>
        </>)
}