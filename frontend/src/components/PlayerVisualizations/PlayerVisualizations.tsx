import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { Player } from "../../types";
import { PageLayout } from "../PageLayout";
import { HeightWeightScatter, PositionBarChart, AgeHistogram } from "./charts";
import chartStyles from "../../styles/charts.module.css";

const PlayerVisualizations: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError("");
    ApiService.getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageLayout
      title="Player Visualizations"
      subtitle="Distribution of player attributes across the league"
      error={error}
      isLoading={isLoading}
      empty="No player data available."
    >
      <div className={chartStyles.chartContainer}>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Height vs Weight</h3>
          <HeightWeightScatter players={players} />
        </div>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Position Distribution</h3>
          <PositionBarChart players={players} />
        </div>
        <div className={`${chartStyles.chartCard} ${chartStyles.chartCardFull}`}>
          <h3 className={chartStyles.chartTitle}>Age Distribution</h3>
          <AgeHistogram players={players} />
        </div>
      </div>
    </PageLayout>
  );
};

export default PlayerVisualizations;
