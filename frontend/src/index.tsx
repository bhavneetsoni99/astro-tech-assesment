import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { LoadingSpinner } from "./components/LoadingSpinner";
import App from './App';
import { PlayersComponent } from "./components/Players";

const PitchesLazy = lazy(() =>
  import("./components/Pitches").then((m) => ({ default: m.PitchesComponent }))
);
const PlayerVisualizationsLazy = lazy(() =>
  import("./components/PlayerVisualizations").then((m) => ({ default: m.PlayerVisualizations }))
);
const PitchVisualizationsLazy = lazy(() =>
  import("./components/PitchVisualizations").then((m) => ({ default: m.PitchVisualizations }))
);
const PlayerDetailsLazy = lazy(() =>
  import("./components/PlayerDetails").then((m) => ({ default: m.PlayerDetails }))
);
const PitchDetailsLazy = lazy(() =>
  import("./components/PitchDetails").then((m) => ({ default: m.PitchDetails }))
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PlayersComponent />} />
          <Route path="players" element={<PlayersComponent />} />
          <Route path="pitches" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PitchesLazy />
            </Suspense>
          } />
          <Route path="player-viz" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PlayerVisualizationsLazy />
            </Suspense>
          } />
          <Route path="pitch-viz" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PitchVisualizationsLazy />
            </Suspense>
          } />
           <Route path="/player-details/:playerId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PlayerDetailsLazy />
            </Suspense>
          } />
          <Route path="/pitch-details/:pitchId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PitchDetailsLazy />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
