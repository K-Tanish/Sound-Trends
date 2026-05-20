import React, { useState } from 'react';
import styles from '../styles/components/AnalysisCards.module.css';
import { GENRES, COLORS, FDATA } from '../data/dataLoader';
import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';


// Register Chart.js components
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export const ScatterPlot: React.FC = () => {
  const [activeGenres, setActiveGenres] = useState<Set<string>>(new Set(GENRES));

  const toggleGenre = (genre: string) => {
    const updated = new Set(activeGenres);
    if (updated.has(genre)) {
      if (updated.size === 1) return; // Must keep at least one active
      updated.delete(genre);
    } else {
      updated.add(genre);
    }
    setActiveGenres(updated);
  };

  const SAMPLE_RATE = 4; // Sub-sample to keep graph rendering performant & neat

  // Construct Chart.js datasets dynamically based on active filter set
  const datasets = GENRES.filter((g) => activeGenres.has(g)).map((g) => {
    const genreIndex = GENRES.indexOf(g);
    
    // Filter and map points
    const points = FDATA.scatter
      .filter((p, i) => p.track_genre === g && i % SAMPLE_RATE === 0)
      .map((p) => ({
        x: p.danceability,
        y: p.popularity,
        r: Math.max(2, p.popularity * 0.04 + 2), // bubble radius based on popularity
        _p: p // pass raw payload to display in tooltips
      }));

    return {
      label: g,
      data: points,
      backgroundColor: `${COLORS[genreIndex]}77`, // semi-transparent background fill
      borderColor: 'transparent',
      borderWidth: 0,
      hoverRadius: 8
    };
  });

  const chartData = { datasets };

  const chartOptions: ChartOptions<'bubble'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We use our own customized header legends
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f1f1f',
        titleColor: '#fff',
        bodyColor: '#b3b3b3',
        borderColor: '#3e3e3e',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const rawPt: any = context.raw;
            if (!rawPt || !rawPt._p) return '';
            const p = rawPt._p;
            return [
              `${p.track_name}`,
              `Artist: ${p.artists}`,
              `Danceability: ${p.danceability} · Popularity: ${p.popularity}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Danceability',
          color: '#6a6a6a'
        },
        min: 0,
        max: 1,
        grid: {
          color: '#282828'
        },
        ticks: {
          color: '#6a6a6a'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Popularity',
          color: '#6a6a6a'
        },
        min: 0,
        max: 100,
        grid: {
          color: '#282828'
        },
        ticks: {
          color: '#6a6a6a'
        }
      }
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHd}>
        <div className={styles.cardTitle}>The Popularity Myth</div>
        <div className={`${styles.ctag} ${styles.ctagG}`}>CHART 1</div>
        <div className={styles.cnote}>Danceability vs Popularity</div>
      </div>
      <div className={styles.cardSub}>
        Assumption check: danceable tracks are not automatically more popular
      </div>

      {/* Filter pills */}
      <div className={styles.pills}>
        {GENRES.map((g, i) => {
          const isOn = activeGenres.has(g);
          const genreColor = COLORS[i];

          return (
            <button
              key={g}
              type="button"
              className={`${styles.pill} ${isOn ? styles.pillOn : ''}`}
              onClick={() => toggleGenre(g)}
              style={{
                backgroundColor: isOn ? genreColor : 'transparent',
                borderColor: genreColor,
                color: isOn ? '#000' : genreColor
              }}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Canvas container */}
      <div style={{ position: 'relative', height: '260px' }}>
        <Bubble data={chartData} options={chartOptions} />
      </div>

      {/* Color legend */}
      <div className={styles.leg}>
        {GENRES.map((g, i) => (
          <div key={g} className={styles.legItem}>
            <div className={styles.legDot} style={{ backgroundColor: COLORS[i] }}></div>
            {g}
          </div>
        ))}
      </div>
    </div>
  );
};
