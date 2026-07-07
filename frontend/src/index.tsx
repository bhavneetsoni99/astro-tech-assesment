import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import App from './App';
import { PlayersComponent } from "./components/Players";
import { PitchesComponent } from "./components/Pitches";

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
          <Route path="pitches" element={<PitchesComponent />} />
        </Route>
        <Route path="/player-details/:playerId" element={<div>Player Details</div>}></Route>
        <Route path="/pitch-details/:pitchId" element={<div>Pitch Details</div>}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
