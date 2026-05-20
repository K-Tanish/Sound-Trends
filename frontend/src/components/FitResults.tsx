import React from 'react';
import styles from '../styles/components/FitResults.module.css';
import type { Track } from '../types';
import { useFitScore } from '../hooks/useFitScore';
import { genreColorMap } from '../data/dataLoader';

interface FitResultsProps {
  selectedTracks: Track[];
  targets: {
    energy: number;
    danceability: number;
    valence: number;
  };
  showResults: boolean;
}

export const FitResults: React.FC<FitResultsProps> = ({
  selectedTracks,
  targets,
  showResults
}) => {
  const { calculateFitScore, getVibeSummary, getGapInsight } = useFitScore();

  if (!showResults || selectedTracks.length === 0) {
    return (
      <div className={styles.resultsArea}>
        <div className={styles.resultsEmpty}>
          <div className={styles.resultsEmptyIcon}>🎵</div>
          <div className={styles.resultsEmptyTxt}>
            Set your target mood &middot; search &amp; select tracks
            <br />
            then click Analyse Fit
          </div>
        </div>
      </div>
    );
  }

  // 1. Rank tracks by score descending
  const ranked = selectedTracks
    .map((track) => ({
      t: track,
      s: calculateFitScore(track, targets)
    }))
    .sort((a, b) => b.s.score - a.s.score);

  // 2. Fetch aggregate summary details
  const { text: summaryText, statusColor } = getVibeSummary(ranked, targets);

  return (
    <div className={styles.resultsArea}>
      {summaryText && (
        <div className={styles.vibeSummary} style={{ backgroundColor: statusColor }}>
          <div dangerouslySetInnerHTML={{ __html: summaryText }}></div>
        </div>
      )}

      <div className={styles.resultsHeader}>
        <div className={styles.resultsTitle}>
          Results &mdash; {ranked.length} track{ranked.length > 1 ? 's' : ''} ranked
        </div>
        <div className={styles.resultsMeta}>
          70% mood fit &middot; 30% genre blueprint
        </div>
      </div>

      <div className={styles.resultsGrid}>
        {ranked.map(({ t, s }, idx) => {
          // Determine score ring color
          const scoreColor = s.score >= 70
            ? '#1DB954' // Green
            : s.score >= 45
              ? '#e8a723' // Orange
              : '#f15e6b'; // Red

          // Circle SVG geometry
          const radius = 26;
          const strokeWidth = 4;
          const center = 32;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference / 4; // Start at top (12 o'clock)
          const strokeDasharray = `${circumference * (s.score / 100)} ${circumference * (1 - s.score / 100)}`;

          // Audio features list mapping
          const featuresToShow = [
            { key: 'energy', label: 'energy', value: t.energy, target: targets.energy },
            { key: 'danceability', label: 'dance', value: t.danceability, target: targets.danceability },
            { key: 'valence', label: 'mood', value: t.valence, target: targets.valence }
          ];

          return (
            <div
              key={t.track_id}
              className={styles.rc}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Left Rank Indicator */}
              <div className={`${styles.rcRank} ${idx === 0 ? styles.top : ''}`}>
                #{idx + 1}
              </div>

              {/* Main Metadata Details */}
              <div>
                <div className={styles.rcName} title={t.track_name}>
                  {t.track_name}
                </div>
                <div className={styles.rcArtist}>{t.artists}</div>
                <div className={styles.rcTags}>
                  <span
                    style={{
                      background: `${genreColorMap[t.track_genre] || '#555'}22`,
                      color: genreColorMap[t.track_genre] || '#aaa',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    {t.track_genre}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--mt)' }}>
                    pop: {t.popularity}
                  </span>
                </div>
                <div className={styles.rcInsight}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getGapInsight(t, s.gaps, s)
                    }}
                  ></span>
                </div>
              </div>

              {/* Right score indicator & slider target tracking */}
              <div className={styles.rcRight}>
                {/* SVG Radial Gauge */}
                <svg className={styles.scoreRing} viewBox="0 0 64 64">
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#282828"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                  <text
                    x={center}
                    y={center + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'DM Sans'"
                    fontSize="13"
                    fontWeight="800"
                    fill={scoreColor}
                  >
                    {s.score}
                  </text>
                </svg>

                <div className={styles.scoreLbl}>FIT SCORE</div>

                {/* Micro bars visual overlays */}
                <div className={styles.featBars}>
                  <div style={{ fontSize: '6px', color: '#555', textAlign: 'right', marginBottom: '2px' }}>
                    WHITE LINE = TARGET
                  </div>

                  {featuresToShow.map((feat) => {
                    const genreColor = genreColorMap[t.track_genre] || '#aaa';
                    return (
                      <div key={feat.key} className={styles.fbRow}>
                        <div className={styles.fbLbl}>{feat.label}</div>
                        <div className={styles.fbTrack}>
                          <div
                            className={styles.fbFill}
                            style={{
                              width: `${feat.value * 100}%`,
                              backgroundColor: `${genreColor}88`
                            }}
                          ></div>
                          <div
                            className={styles.fbTarget}
                            style={{ left: `${feat.target * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
