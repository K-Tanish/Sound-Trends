import React, { useState } from 'react';
import styles from '../styles/components/AnalysisCards.module.css';
import { GENRES, FDATA } from '../data/dataLoader';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';


// Register Bar elements
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const DeltaChart: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = (e?: React.MouseEvent) => {
    // Prevent double propagation if clicking badges or close buttons
    e?.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const feats = FDATA.feat6;
  const fColors = ['#1DB954', '#f15e6b', '#e8a723', '#2e77d0', '#7c4dbe', '#00b4b4'];
  //                dance       energy     valence    acoustic   speech     instrument

  // Construct Chart.js datasets
  const datasets = feats.map((f, fi) => {
    const data = GENRES.map((g) => (FDATA.delta[g] ? FDATA.delta[g][f] : 0));
    return {
      label: f,
      data,
      backgroundColor: `${fColors[fi]}bb`, // slight opacity
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 2
    };
  });

  const chartData = {
    labels: GENRES,
    datasets
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#6a6a6a',
          boxWidth: 8,
          font: {
            size: 8
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f1f1f',
        titleColor: '#fff',
        bodyColor: '#b3b3b3',
        borderColor: '#3e3e3e',
        borderWidth: 1,
        padding: 8
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6a6a6a',
          maxRotation: 30
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Top quartile − Bottom quartile',
          color: '#6a6a6a',
          font: {
            size: 8
          }
        },
        ticks: {
          color: '#6a6a6a'
        },
        grid: {
          color: '#282828'
        },
        suggestedMin: -0.2,
        suggestedMax: 0.2
      }
    }
  };

  return (
    <div
      className={`${styles.card} ${styles.c3Wrapper} ${isFlipped ? styles.flipped : ''}`}
      onDoubleClick={() => toggleFlip()}
      title="Double-click to explore the Classical mystery"
    >
      <div className={styles.c3Flipper}>
        {/* FRONT FACE: Grouped Bar Chart */}
        <div className={styles.c3Face}>
          <div className={styles.cardHd}>
            <div className={styles.cardTitle}>The Sound of Success</div>
            <div className={`${styles.ctag} ${styles.ctagO}`}>CHART 3</div>
            <div className={styles.cnote} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={styles.flipDot}></div>
              <span className={styles.flipBadge} onClick={(e) => toggleFlip(e)}>
                double-click to explore
              </span>
            </div>
          </div>
          <div className={styles.cardSub}>
            Top 25% vs Bottom 25% — feature delta separating hits from flops
          </div>
          <div style={{ position: 'relative', height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* BACK FACE: Detailed Paradox Summary */}
        <div className={`${styles.c3Face} ${styles.c3Back}`} style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '24px' }}>
            <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>🎭</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--tx)', marginBottom: '4px' }}>
                The Classical Mystery
              </div>
              <div style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: 1.5 }}>
                Why popular classical tracks have <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>less</em> instrumentalness than unpopular ones
              </div>
            </div>
            <span className={styles.flipBadge} onClick={(e) => toggleFlip(e)}>
              &#x2715; close
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            {/* Visual: vocal % comparison bars */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>
                Vocal / mixed tracks inside each group
              </div>

              {/* Hits */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)' }}>
                    Hits &nbsp;(top 25%)
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--mono)' }}>
                    57.5%
                  </span>
                </div>
                <div className={styles.barContainer}>
                  <div className={styles.c3BarHits}></div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--mt)', marginTop: '6px' }}>
                  84 of 146 hit tracks are vocal or mixed — Carnatic, bhajans, crossover
                </div>
              </div>

              {/* Flops */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx2)' }}>
                    Flops (bottom 25%)
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--tx2)', fontFamily: 'var(--mono)' }}>
                    11.2%
                  </span>
                </div>
                <div className={styles.barContainer}>
                  <div className={styles.c3BarFlops}></div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--mt)', marginTop: '6px' }}>
                  16 of 143 flop tracks are vocal — most are authentically instrumental
                </div>
              </div>
            </div>

            {/* Explanatory callout block */}
            <div style={{ background: 'rgba(232, 167, 35, .08)', borderLeft: '4px solid var(--orange)', padding: '16px 20px', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: '13px', color: 'var(--tx)', lineHeight: 1.8 }}>
                Popular &ldquo;classical&rdquo; on Spotify is dominated by vocal genres. The flop group is mostly authentic Western instrumental music — giving it a <strong>higher</strong> instrumentalness average. That gap produces the negative delta.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeltaChart;
