import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/ToolPanels.module.css';
import type { Track } from '../types';
import { FDATA, genreColorMap } from '../data/dataLoader';

interface TrackSelectorProps {
  selectedTracks: Track[];
  selectedGenre: string;
  onAddTrack: (track: Track) => void;
  onRemoveTrack: (trackId: string) => void;
  onRunAnalysis: () => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  selectedTracks,
  selectedGenre,
  onAddTrack,
  onRemoveTrack,
  onRunAnalysis
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search logic triggered on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const qLower = query.toLowerCase();
    const matches = FDATA.tracks
      .filter((t) => {
        // Genre filter check
        if (selectedGenre && t.track_genre !== selectedGenre) return false;
        
        return (
          t.track_name.toLowerCase().includes(qLower) ||
          t.artists.toLowerCase().includes(qLower)
        );
      })
      .slice(0, 8); // cap at 8 suggestions

    setSuggestions(matches);
    setIsOpen(matches.length > 0);
  }, [query, selectedGenre]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrack = (track: Track) => {
    if (selectedTracks.length >= 10) return;
    onAddTrack(track);
    // Don't clear input to allow fast multi-selection (as in modified index.html)
    setIsOpen(false);
  };

  return (
    <div ref={containerRef}>
      <div className={styles.panel}>
        <div className={styles.panelTitle}>② Search & Select Tracks</div>

        <div className={styles.panelSection}>
          <div className={styles.panelLabel}>Search by track name or artist</div>
          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="🔍  Search tracks or artists…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setIsOpen(true)}
              autoComplete="off"
            />
            {isOpen && (
              <div className={`${styles.searchDrop} ${styles.open}`}>
                {suggestions.map((t) => (
                  <div
                    key={t.track_id}
                    className={styles.searchItem}
                    onClick={() => handleSelectTrack(t)}
                  >
                    <div className={styles.siName}>{t.track_name}</div>
                    <div className={styles.siArtist}>{t.artists}</div>
                    <span
                      className={styles.siGenre}
                      style={{
                        backgroundColor: `${genreColorMap[t.track_genre] || '#555'}22`,
                        color: genreColorMap[t.track_genre] || '#aaa'
                      }}
                    >
                      {t.track_genre}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.panelSection} style={{ marginBottom: 0 }}>
          <div className={styles.panelLabel}>
            Selected <span style={{ color: 'var(--green)' }}>{selectedTracks.length}/10</span>
          </div>
          <div className={styles.chips}>
            {selectedTracks.length === 0 ? (
              <div className={styles.emptyChips}>No tracks selected yet</div>
            ) : (
              selectedTracks.map((t) => (
                <div key={t.track_id} className={styles.chip}>
                  <div className={styles.chipName} title={t.track_name}>
                    {t.track_name}
                  </div>
                  <div className={styles.chipRight}>
                    <span
                      className={styles.chipGenre}
                      style={{ color: genreColorMap[t.track_genre] || '#aaa' }}
                    >
                      {t.track_genre}
                    </span>
                    <span
                      className={styles.chipRm}
                      onClick={() => onRemoveTrack(t.track_id)}
                      title="Remove"
                    >
                      &times;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.analyseBtn}
        disabled={selectedTracks.length === 0}
        onClick={onRunAnalysis}
      >
        Analyse Fit &rarr;
      </button>
    </div>
  );
};
