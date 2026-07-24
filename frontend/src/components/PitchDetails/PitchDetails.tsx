import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../services/api";
import { Pitch } from "../../types";
import { formatDescription, CHART_COLORS, OUTCOME_BG_COLORS, OUTCOME_COLORS } from "../../utils";
import { PageLayout } from "../PageLayout";
import { PitchLocationDetail, SituationDisplay, BattedBallDisplay } from "./charts";
import chartStyles from "../../styles/charts.module.css";
import styles from "./pitchDetails.styles.module.css";

const PitchDetails: React.FC = () => {
  const { pitchId } = useParams<{ pitchId: string }>();
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pitchId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError("");
    ApiService.getPitch(Number(pitchId))
      .then(setPitch)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [pitchId]);

  if (error) return <PageLayout error={error} />;
  if (isLoading) return <PageLayout isLoading />;
  if (!pitch) return <PageLayout empty="Pitch not found." />;

  const speed = Number(pitch.release_speed);
  const speedColor = speed >= 95 ? "#d32f2f" : speed >= 90 ? CHART_COLORS.orange : CHART_COLORS.navy;

  const outcomeLabel = {S: "Strike", B: "Ball", X: "In-Play"} as const;
  type OutcomeKey = keyof typeof outcomeLabel;

  const outcomeBg = OUTCOME_BG_COLORS[pitch.type as OutcomeKey]  || CHART_COLORS.muted;

  const outcomeColor = OUTCOME_COLORS[pitch.type as OutcomeKey] || CHART_COLORS.text

  const eventLabel = formatDescription(pitch.events)|| null;

  return (
    <PageLayout>
      <div className={styles.pitchCard}>
        <div className={styles.pitchIdentity}>
          <div className={styles.pitchBadge} style={{ background: speedColor }}>
            <span className={styles.pitchBadgeSpeed}>{speed.toFixed(1)}</span>
            <span className={styles.pitchBadgeLabel}>mph</span>
          </div>
          <div>
            <h2 className={styles.pitchName}>{pitch.pitch_name}</h2>
            <div className={styles.pitchMeta}>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Type</span>
                <span className={styles.metaValue}>{pitch.pitch_type}</span>
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Date</span>
                <span className={styles.metaValue}>{pitch.game_date}</span>
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Inning</span>
                <span className={styles.metaValue}>{pitch.inning ? `${pitch.inning_topbot || ""} ${pitch.inning}` : "—"}</span>
              </span>
              <span className={styles.outcomeBadge} style={{ background: outcomeBg, color: outcomeColor }}>
                {outcomeLabel[pitch.type as OutcomeKey] || pitch.type}{eventLabel ? ` · ${eventLabel}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.matchupCard}>
          <div className={styles.matchupPlayer}>
            <span className={styles.matchupName}>
              {pitch.pitcher_details.first_name} {pitch.pitcher_details.last_name}
            </span>
            <span className={styles.matchupDetail}>{pitch.pitcher_details.team} · {pitch.p_throws ? `Throws: ${pitch.p_throws}` : ""}</span>
          </div>
          <span className={styles.matchupVs}>vs</span>
          <div className={styles.matchupPlayer}>
            <span className={styles.matchupName}>
              {pitch.batter_details.first_name} {pitch.batter_details.last_name}
            </span>
            <span className={styles.matchupDetail}>{pitch.batter_details.team} · {pitch.stand ? `Bats: ${pitch.stand}` : ""}</span>
          </div>
        </div>
      </div>

      <div className={chartStyles.chartContainer}>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Pitch Location</h3>
          <PitchLocationDetail pitch={pitch} />
        </div>
        <div className={chartStyles.chartCard}>
          <h3 className={chartStyles.chartTitle}>Game Situation</h3>
          <SituationDisplay pitch={pitch} />
        </div>
        {pitch.launch_speed && Number(pitch.launch_speed) > 0 && (
          <div className={`${chartStyles.chartCard} ${chartStyles.chartCardFull}`}>
            <h3 className={chartStyles.chartTitle}>Batted Ball Data</h3>
            <BattedBallDisplay pitch={pitch} />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PitchDetails;
