import React, { useState } from "react";
import "./App.css";
import { PlayerFilterOptions } from "./types";
import PlayerFilterControls from "./components/PlayerFilterControls/PlayerFilterControls";
import { PlayerTableWrapper } from "./components/PlayerTable";

const App: React.FC = () => {
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  const handleFilterChange = (filters: PlayerFilterOptions) => {};

  return (
    <div className="App">
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>

      <main>
        {/* TODO: Player Filter controls */}
        <section className="filter-section">
          <PlayerFilterControls
            onFilterChange={handleFilterChange}
            availableTeams={availableTeams}
            availablePositions={availablePositions}
          />
        </section>

        {/* TODO: Player data table */}
        <section className="data-section">
          <PlayerTableWrapper filters={{}} />
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
