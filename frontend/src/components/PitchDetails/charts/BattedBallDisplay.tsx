import React from "react";
import { Pitch } from "../../../types";
import detailStyles from "../pitchDetails.styles.module.css";

export const BattedBallDisplay: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
  const ls = Number(pitch.launch_speed);
  const la = Number(pitch.launch_angle);
  const dist = pitch.hit_distance_sc ? Number(pitch.hit_distance_sc) : null;

  if (!ls || ls <= 0) return null;

  const items = [
    { label: "Launch Speed", value: `${ls.toFixed(1)} mph` },
    { label: "Launch Angle", value: `${la.toFixed(1)}°` },
    { label: "Distance", value: dist ? `${dist} ft` : "—" },
  ];

  return (
      <div className={detailStyles.situationGrid}>
        {items.map(item => (
          <div key={item.label} className={detailStyles.situationCard}>
            <div className={detailStyles.situationValue}>{item.value}</div>
            <div className={detailStyles.situationLabel}>{item.label}</div>
          </div>
        ))}
      </div>
  );
};
