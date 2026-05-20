import React, { useEffect, useState } from 'react';
import styles from '../styles/components/KPISection.module.css';

export const KPISection: React.FC = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Small timeout to trigger width expansion transition
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.kpiRow}>
      {/* Card 1: Tracks Analysed */}
      <div className={styles.kpi} style={{ '--kc': '#1DB954' } as React.CSSProperties}>
        <div className={styles.kpiLbl}>Tracks Analysed</div>
        <div className={styles.kpiVal}>89,740</div>
        <div className={styles.kpiDesc}>Unique tracks in full dataset</div>
        <div className={styles.kpiTrack}>
          <div
            className={styles.kpiFill}
            style={{ width: animate ? '90%' : '0%' }}
          ></div>
        </div>
      </div>

      {/* Card 2: Focus Genres */}
      <div className={styles.kpi} style={{ '--kc': '#2e77d0' } as React.CSSProperties}>
        <div className={styles.kpiLbl}>Focus Genres</div>
        <div className={styles.kpiVal}>8</div>
        <div className={styles.kpiDesc}>pop · hip-hop · rock · jazz · classical · electronic · metal · r-n-b</div>
        <div className={styles.kpiTrack}>
          <div
            className={styles.kpiFill}
            style={{ width: animate ? '100%' : '0%' }}
          ></div>
        </div>
      </div>

      {/* Card 3: Average Popularity */}
      <div className={styles.kpi} style={{ '--kc': '#e8a723' } as React.CSSProperties}>
        <div className={styles.kpiLbl}>Avg Popularity</div>
        <div className={styles.kpiVal}>
          33.2
          <span style={{ fontSize: '1rem', color: 'var(--tx2)' }}>/100</span>
        </div>
        <div className={styles.kpiDesc}>Spotify stream-based score (0–100)</div>
        <div className={styles.kpiTrack}>
          <div
            className={styles.kpiFill}
            style={{ width: animate ? '33%' : '0%' }}
          ></div>
        </div>
      </div>

      {/* Card 4: Most Popular Genre */}
      <div className={styles.kpi} style={{ '--kc': '#7c4dbe' } as React.CSSProperties}>
        <div className={styles.kpiLbl}>Most Popular Genre</div>
        <div className={styles.kpiVal} style={{ color: '#7c4dbe' }}>
          Metal
        </div>
        <div className={styles.kpiDesc}>Avg popularity 56.4 — highest of all 8 genres</div>
        <div className={styles.kpiTrack}>
          <div
            className={styles.kpiFill}
            style={{
              width: animate ? '56.4%' : '0%',
              background: '#7c4dbe'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
