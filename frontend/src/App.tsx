import React, { useState } from "react";
import "./App.css";
import { PlayerFilterOptions } from "./types";
import { PlayerFilterWrapper } from "./components/PlayerFilterControls";
import { PlayerTableWrapper } from "./components/PlayerTable";

const App: React.FC = () => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  return (
    <div className="App">
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>

      <main>
        <section className="filter-section">
          <PlayerFilterWrapper
            onFilterChange={setFilters}
            filters={filters}
          />
        </section>

        <section className="data-section">
          <PlayerTableWrapper filters={filters} />
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
