import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../services/api";
import { Player, Pitch } from "../../types";
import { CHART_COLORS } from "../../utils";
import { PageLayout } from "../PageLayout";
import chartStyles from "../../styles/charts.module.css";
import pageStyles from "../../styles/page.module.css";
import styles from "./playerDetails.styles.module.css";

const PlayerDetails: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [pitchesAsPitcher, setPitchesAsPitcher] = useState<Pitch[]>([]);
  const [pitchesAsBatter, setPitchesAsBatter] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) return;
    setIsLoading(true);
    setError("");
    const id = Number(playerId);
    Promise.all([
      ApiService.getPlayers({}),
      ApiService.getPitches({ pitcher: id, limit: 1000 }),
      ApiService.getPitches({ batter: id, limit: 1000 }),
    ])
      .then(([players, pitchingRes, battingRes]) => {
        const found = players.find(p => p.player_id === id);
        if (!found) { setError("Player not found"); return; }
        setPlayer(found);
        setPitchesAsPitcher(pitchingRes.pitches);
        setPitchesAsBatter(battingRes.pitches);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [playerId]);

  if (error) return <PageLayout error={error} />;
  if (isLoading) return <PageLayout isLoading />;
  if (!player) return <PageLayout empty="Player not found." />;

  const initial = `${player.first_name?.[0] ?? ""}${player.last_name?.[0] ?? ""}`;

  return (
    <PageLayout>
      <div className={styles.playerCard}>
        <div className={styles.playerAvatar}>{initial}</div>
        <div className={styles.playerInfo}>
          <h2 className={styles.playerName}>{player.first_name} {player.last_name}</h2>
          <div className={styles.playerMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Team</span>
              <span className={styles.metaValue}>{player.team}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Position</span>
              <span className={styles.metaValue}>{player.primary_position}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Bats</span>
              <span className={styles.metaValue}>{player.bats}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Throws</span>
              <span className={styles.metaValue}>{player.throws}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Height</span>
              <span className={styles.metaValue}>{player.height_feet}'{player.height_inches}"</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Weight</span>
              <span className={styles.metaValue}>{player.weight} lbs</span>
            </div>
          </div>
        </div>
      </div>

      {pitchesAsPitcher.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} style={{ background: CHART_COLORS.navy }}>P</div>
            <h3 className={styles.sectionTitle}>Pitching — {pitchesAsPitcher.length} pitches</h3>
          </div>
          <div className={chartStyles.chartContainer}>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Pitch Type Mix</h4>
            </div>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Speed by Pitch Type</h4>
            </div>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Outcome by Pitch Type</h4>
            </div>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Pitch Location</h4>
            </div>
          </div>
        </div>
      )}

      {pitchesAsBatter.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} style={{ background: CHART_COLORS.orange }}>B</div>
            <h3 className={styles.sectionTitle}>Batting — {pitchesAsBatter.length} pitches faced</h3>
          </div>
          <div className={chartStyles.chartContainer}>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Pitches Faced by Type</h4>

            </div>
            <div className={chartStyles.chartCard}>
              <h4 className={chartStyles.chartTitle}>Outcome Distribution</h4>

            </div>
            <div className={`${chartStyles.chartCard} ${chartStyles.chartCardFull}`}>
              <h4 className={chartStyles.chartTitle}>Launch Speed vs Launch Angle</h4>
            </div>
          </div>
        </div>
      )}

      {pitchesAsPitcher.length === 0 && pitchesAsBatter.length === 0 && (
        <div className={pageStyles.empty}>No pitch data available for this player.</div>
      )}
    </PageLayout>
  );
};

export default PlayerDetails;
