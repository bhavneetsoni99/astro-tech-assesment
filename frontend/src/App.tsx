import React from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { NavLink, Outlet, type NavLinkRenderProps, useLocation } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallBack";
import styles from "./styles/styles.module.css";
import astrosLogo from "./assets/astros.png";

const TABLE_LINKS = [
  { to: "players", label: "Players" },
  { to: "pitches", label: "Pitches" },
  { to: "player-viz", label: "Player Viz" },
  { to: "pitch-viz", label: "Pitch Viz" },
];

const App: React.FC = () => {
  const location = useLocation();
  const tableClass = ["/", "/players", "/pitches"].includes(location.pathname) ? 
    "tableLayoutHeight" 
    : "";
  return (
    <div className={styles.App}>
      <header className={styles.header}>
        <img className={styles.logo} src={astrosLogo} alt="Houston Astros" />
        <div className={styles.headerContent}>
          <h1 className={styles.heading}>Baseball Player Statistics</h1>
          <p className={styles.subHeading}>Explore player statistics</p>
        </div>
        <img className={styles.logo} src="https://images.ctfassets.net/iiozhi00a8lc/t117_url_logoastros_url_svg/0f490c816cb2bc29d560315b180e9cf5/t117_url_logo.svg" alt="Houston Astros URL logo"></img>
      </header>
      <nav className={styles.nav}>
        {TABLE_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }: NavLinkRenderProps) =>
              `${styles.navLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className={styles[tableClass]}>
        <ErrorBoundary
          fallbackRender={(props) => (
            <ErrorFallback error={props.error as Error | null}
              resetErrorBoundary={() => (window.location.href = '/')} />
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
