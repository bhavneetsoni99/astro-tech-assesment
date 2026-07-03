import React, { useState } from "react";
import styles from "./styles/styles.module.css";
import { PlayerFilterOptions } from "./types";
import { PlayerFilterWrapper } from "./components/PlayerFilterControls";
import { PlayerTable } from "./components/PlayerTable";

const App: React.FC = () => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  return (
    <div className={styles.App}>
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>

      <main>
        <section className={styles.filterSection}>
          <PlayerFilterWrapper
            onFilterChange={setFilters}
            filters={filters}
          />
        </section>

        <section className={styles.dataSection}>
          <PlayerTable filters={filters} />
        </section>

        {/* TODO: Pitch Filter Controls}
        {/* TODO: Implement pitches table */}
      </main>

      <footer>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
