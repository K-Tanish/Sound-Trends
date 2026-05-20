import React, { useState } from 'react';
import styles from '../styles/components/ToolPanels.module.css';
import { GENRES } from '../data/dataLoader';

interface VibeSlidersProps {
  energy: number;
  danceability: number;
  valence: number;
  selectedGenre: string;
  onSlidersChange: (values: { energy: number; danceability: number; valence: number }) => void;
  onGenreChange: (genre: string) => void;
}

interface Preset {
  name: string;
  energy: number;
  danceability: number;
  valence: number;
}

const PRESETS: Preset[] = [
  { name: 'Dance/Party', energy: 0.85, danceability: 0.85, valence: 0.80 },
  { name: 'Long Drive', energy: 0.40, danceability: 0.55, valence: 0.75 },
  { name: 'Late Night', energy: 0.30, danceability: 0.35, valence: 0.40 },
  { name: 'Deep Focus', energy: 0.15, danceability: 0.25, valence: 0.30 }
];

export const VibeSliders: React.FC<VibeSlidersProps> = ({
  energy,
  danceability,
  valence,
  selectedGenre,
  onSlidersChange,
  onGenreChange
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (preset: Preset) => {
    onSlidersChange({
      energy: preset.energy,
      danceability: preset.danceability,
      valence: preset.valence
    });
    setActivePreset(preset.name);
  };

  const handleSliderChange = (key: 'energy' | 'danceability' | 'valence', val: number) => {
    setActivePreset(null); // clear preset selection on manual adjustments
    onSlidersChange({
      energy: key === 'energy' ? val : energy,
      danceability: key === 'danceability' ? val : danceability,
      valence: key === 'valence' ? val : valence
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>① Target Mood Profile</div>

      <div className={styles.panelSection}>
        <div className={styles.panelLabel}>Vibe Presets</div>
        <div className={styles.vibePresets}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className={`${styles.vibeBtn} ${activePreset === p.name ? styles.vibeBtnActive : ''}`}
              onClick={() => applyPreset(p)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className={styles.panelLabel}>Audio Sliders</div>

        {/* Energy Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span className={styles.sliderName}>Energy</span>
            <span className={styles.sliderVal}>{energy.toFixed(2)}</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="1"
            step="0.01"
            value={energy}
            onChange={(e) => handleSliderChange('energy', parseFloat(e.target.value))}
          />
        </div>

        {/* Danceability Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span className={styles.sliderName}>Danceability</span>
            <span className={styles.sliderVal}>{danceability.toFixed(2)}</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="1"
            step="0.01"
            value={danceability}
            onChange={(e) => handleSliderChange('danceability', parseFloat(e.target.value))}
          />
        </div>

        {/* Valence Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span className={styles.sliderName}>Valence (Mood)</span>
            <span className={styles.sliderVal}>{valence.toFixed(2)}</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="1"
            step="0.01"
            value={valence}
            onChange={(e) => handleSliderChange('valence', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.panelSection} style={{ marginBottom: 0 }}>
        <div className={styles.panelLabel}>Genre Focus (optional)</div>
        <select
          className={styles.genreSelect}
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
