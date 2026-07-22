import React from "react";
import { Pitch } from "../../../types";
import detailStyles from "../pitchDetails.styles.module.css";

export const SituationDisplay: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
  const items = [
    { label: "Balls", value: pitch.balls },
    { label: "Strikes", value: pitch.strikes },
    { label: "Outs", value: pitch.outs_when_up },
    { label: "Inning", value: pitch.inning ? `${pitch.inning_topbot || ""} ${pitch.inning}` : "—" },
  ];

  return (
    <div className={detailStyles.situationGrid}>
      {items.map(item => (
        <div key={item.label} className={detailStyles.situationCard}>
          <div className={detailStyles.situationValue}>{item.value || "—"}</div>
          <div className={detailStyles.situationLabel}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};
