import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/components/AnalysisCards.module.css';
import { FDATA } from '../data/dataLoader';
import * as d3 from 'd3';

export const Heatmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    visible: boolean;
  }>({ x: 0, y: 0, content: '', visible: false });

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous drawings
    containerRef.current.innerHTML = '';

    const labels = FDATA.corr.labels;
    const matrix = FDATA.corr.matrix;
    const n = labels.length;

    if (n === 0) return;

    const sz = 34; // cell size
    const pad = { top: 8, left: 88, bottom: 86, right: 8 };
    const W = sz * n + pad.left + pad.right;
    const H = sz * n + pad.top + pad.bottom;

    // Create SVG
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${W} ${H}`);

    // Interpolator for correlation colors (-1: red, 0: black, 1: green)
    const cScale = d3
      .scaleSequential<string>()
      .domain([-1, 1])
      .interpolator((t) => {
        if (t < 0.5) {
          // interpolate between red and black surface
          return d3.interpolateRgb('#f15e6b', '#121212')(t * 2);
        }
        // interpolate between black surface and Spotify green
        return d3.interpolateRgb('#121212', '#1DB954')((t - 0.5) * 2);
      });

    const g = svg.append('g').attr('transform', `translate(${pad.left},${pad.top})`);

    // Render cells
    labels.forEach((r, i) =>
      labels.forEach((c, j) => {
        const v = matrix[i][j];

        // Draw rectangle cell
        g.append('rect')
          .attr('x', j * sz)
          .attr('y', i * sz)
          .attr('width', sz - 1)
          .attr('height', sz - 1)
          .attr('rx', 3)
          .attr('fill', cScale(v))
          .style('cursor', 'pointer')
          .on('mousemove', (event) => {
            // Calculate tooltip overflow boundary check
            let x = event.clientX + 14;
            const y = event.clientY - 10;
            if (x + 230 > window.innerWidth) {
              x = event.clientX - 240;
            }
            setTooltip({
              x,
              y,
              content: `<strong>${r} &times; ${c}</strong><span>r = ${v.toFixed(3)}</span>`,
              visible: true
            });
          })
          .on('mouseleave', () => {
            setTooltip((prev) => ({ ...prev, visible: false }));
          });

        // Add correlation labels in text if correlation is significant (|r| > 0.2)
        if (Math.abs(v) > 0.2) {
          g.append('text')
            .attr('x', j * sz + sz / 2)
            .attr('y', i * sz + sz / 2 + 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', 7)
            .attr('fill', Math.abs(v) > 0.55 ? '#000' : '#fff')
            .attr('opacity', 0.9)
            .text(v.toFixed(2));
        }
      })
    );

    // Render axis labels
    labels.forEach((l, i) => {
      // Bottom diagonal-slanted labels
      g.append('text')
        .attr('x', i * sz + sz / 2)
        .attr('y', n * sz + 7)
        .attr('text-anchor', 'end')
        .attr('transform', `rotate(-38,${i * sz + sz / 2},${n * sz + 7})`)
        .attr('font-size', 8)
        .attr('fill', '#6a6a6a')
        .text(l);

      // Left labels
      g.append('text')
        .attr('x', -5)
        .attr('y', i * sz + sz / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 8)
        .attr('fill', '#6a6a6a')
        .text(l);
    });
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHd}>
        <div className={styles.cardTitle}>Feature Correlation Heatmap</div>
        <div className={`${styles.ctag} ${styles.ctagB}`}>CHART 2</div>
        <div className={styles.cnote}>Pearson r</div>
      </div>
      <div className={styles.cardSub}>
        How audio features relate to each other and to popularity
      </div>
      <div ref={containerRef} className={styles.heatmapContainer} id="heatmap"></div>

      {/* Tooltip Overlay */}
      {tooltip.visible && (
        <div
          className="tip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            opacity: 1,
            pointerEvents: 'none'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};
