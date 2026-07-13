import React from "react";
import { PlayerFilterWrapper } from "../PlayerFilterControls";
import { PlayerTable } from "../PlayerTable";

export const PlayersComponent: React.FC = () => {
  return (<>
            <PlayerFilterWrapper
            />
            <PlayerTable />
        </>)
}  