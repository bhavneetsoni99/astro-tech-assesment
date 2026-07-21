import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { Pitch } from "../../types";
import { PageLayout } from "../PageLayout";
import chartStyles from "../../styles/charts.module.css";

const PitchVisualizations: React.FC = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  
    useEffect(() => {
       ApiService.getAllPitches()
        .then((res) => setPitches(res))
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }, []);


  return (
    <PageLayout
      title="Pitch Visualizations"
      subtitle="Distribution of pitch attributes across tracked games"
      error={error}
      isLoading={isLoading}
      empty="No pitch data available."
    >
      <div className={chartStyles.chartContainer}>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Pitch Type Distribution</h3>
          
        </div>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Release Speed Distribution</h3>
         
        </div>
        <div className={`${chartStyles.chartCard} ${chartStyles.chartCardFull}`}>
          <h3 className={chartStyles.chartTitle}>Pitch Outcome by Type</h3>
         
        </div>
      </div>
    </PageLayout>
  );
};

export default PitchVisualizations;
