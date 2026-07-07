import React from "react";
import styles from "./styles/styles.module.css";
import { NavLink, Outlet } from "react-router-dom";

const App: React.FC = () => {
  return (
    <div className={styles.App}>
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>
      <nav>
        <NavLink to="players"
          className={({ isActive }) => isActive ? styles.active : undefined}>
          Players</NavLink>
        <NavLink to="pitches"
          className={({ isActive }) => isActive ? styles.active : undefined}>
        Pitches</NavLink>
      </nav>

      <main>          
        <Outlet />
      </main>

      <footer>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
