import React, { useState } from 'react';
import styles from './styles/App.module.css';
import { Sidebar } from './components/Sidebar';
import { KPISection } from './components/KPISection';
import { ScatterPlot } from './components/ScatterPlot';
import { Heatmap } from './components/Heatmap';
import { DeltaChart } from './components/DeltaChart';
import { VibeSliders } from './components/VibeSliders';
import { TrackSelector } from './components/TrackSelector';
import { FitResults } from './components/FitResults';
import type { Track } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'tool' | 'conclusions'>('analysis');
  const [bleedColor, setBleedColor] = useState('#1DB95420'); // Initial color bleed tint

  // Playlist Intelligence Tool states
  const [targets, setTargets] = useState({
    energy: 0.70,
    danceability: 0.65,
    valence: 0.50
  });
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleTabChange = (tab: 'analysis' | 'tool' | 'conclusions', color: string) => {
    setActiveTab(tab);
    setBleedColor(color);
  };

  // State update handlers
  const handleSlidersChange = (newTargets: typeof targets) => {
    setTargets(newTargets);
    setShowResults(false); // Reset analysis status on changes to require re-analysis
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setSelectedTracks([]); // Clear selected tracks since they must focus on the new genre
    setShowResults(false);
  };

  const handleAddTrack = (track: Track) => {
    if (selectedTracks.find((t) => t.track_id === track.track_id)) return;
    setSelectedTracks([...selectedTracks, track]);
    setShowResults(false);
  };

  const handleRemoveTrack = (id: string) => {
    setSelectedTracks(selectedTracks.filter((t) => t.track_id !== id));
    setShowResults(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Panel Content */}
      <main
        className={styles.main}
        style={{
          background: `linear-gradient(180deg, ${bleedColor} 0px, var(--bg) 340px)`
        }}
      >
        {/* TAB 1: ANALYSIS */}
        {activeTab === 'analysis' && (
          <div>
            <div className={styles.hero}>
              <div className={styles.heroEyebrow}>Spotify · 89,740 tracks · 8 genres</div>
              <h1 className={styles.heroTitle}>
                Spotify Audio<br />
                <em>Analytics</em> Dashboard
              </h1>
              <div className={styles.heroMeta}>
                What audio patterns are linked with popularity — and how they differ across genres
              </div>
            </div>

            <div className={styles.page} style={{ paddingTop: '1rem' }}>
              {/* KPI cards */}
              <KPISection />

              {/* Row 2: Scatter & Heatmap */}
              <div className={styles.row2}>
                <ScatterPlot />
                <Heatmap />
              </div>

              {/* Chart 3: Success Delta Grouped Bars */}
              <div style={{ marginBottom: '1.2rem' }}>
                <DeltaChart />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAYLIST INTELLIGENCE */}
        {activeTab === 'tool' && (
          <div>
            <div className={styles.hero}>
              <div className={styles.heroEyebrow}>Data-driven curation</div>
              <h1 className={styles.heroTitle}>
                Playlist <em style={{ color: 'var(--blue)' }}>Intelligence</em> Tool
              </h1>
              <div className={styles.heroMeta}>
                Define your target mood · Search tracks · Get ranked fit scores
              </div>
            </div>

            <div className={styles.toolLayout}>
              {/* Left Form controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <VibeSliders
                  energy={targets.energy}
                  danceability={targets.danceability}
                  valence={targets.valence}
                  selectedGenre={selectedGenre}
                  onSlidersChange={handleSlidersChange}
                  onGenreChange={handleGenreChange}
                />
                <TrackSelector
                  selectedTracks={selectedTracks}
                  selectedGenre={selectedGenre}
                  onAddTrack={handleAddTrack}
                  onRemoveTrack={handleRemoveTrack}
                  onRunAnalysis={() => setShowResults(true)}
                />
              </div>

              {/* Right Output lists */}
              <FitResults
                selectedTracks={selectedTracks}
                targets={targets}
                showResults={showResults}
              />
            </div>
          </div>
        )}

        {/* TAB 3: CONCLUSIONS */}
        {activeTab === 'conclusions' && (
          <div>
            <div className={styles.hero}>
              <div className={styles.heroEyebrow}>Story takeaways</div>
              <h1 className={styles.heroTitle}>Conclusions</h1>
              <div className={styles.heroMeta}>
                What the data actually says about music, popularity, and genre identity
              </div>
            </div>

            <div className={styles.page} style={{ paddingTop: '1rem' }}>
              <div className={styles.concGrid}>
                {/* Card 1 */}
                <div className={styles.concCard} style={{ '--cc': '#1DB954' } as React.CSSProperties}>
                  <div className={styles.concHead}>Danceability Myth</div>
                  <div className={styles.concBody}>
                    Danceability and popularity have a weak link. A song can be popular even if it is not highly danceable.
                  </div>
                </div>

                {/* Card 2 */}
                <div className={styles.concCard} style={{ '--cc': '#2e77d0' } as React.CSSProperties}>
                  <div className={styles.concHead}>Heatmap Reality</div>
                  <div className={styles.concBody}>
                    Energy and loudness are the most connected features (|r| = 0.84). When one changes, the other usually changes too — louder production feels more intense.
                  </div>
                </div>

                {/* Card 3 */}
                <div className={styles.concCard} style={{ '--cc': '#e8a723' } as React.CSSProperties}>
                  <div className={styles.concHead}>Success Signature</div>
                  <div className={styles.concBody}>
                    Popular songs in each genre have their own pattern. There is no single universal formula for a hit — the Sound of Success is genre-specific and measurable.
                  </div>
                </div>
              </div>

              {/* Bottom statement explanation */}
              <div style={{ marginTop: '1.5rem', background: 'var(--s2)', borderRadius: 'var(--radius)', padding: '1.5rem 2rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '.5rem' }}>Why This Tool Exists</div>
                <div style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: 1.9, maxWidth: '700px' }}>
                  Audio features are an underused signal in playlist curation. Curators currently rely on gut instinct to match tracks to moods — slow, subjective, hard to justify. The Playlist Intelligence Tool maps each track's sonic profile against a target mood and a genre-specific success blueprint, giving curators a data-backed ranking they can act on and defend.{' '}
                  <em style={{ color: 'var(--mt)', fontStyle: 'normal' }}>
                    Limitation acknowledged: sonic fit does not predict virality — marketing, timing, and artist reach remain beyond any audio analysis tool.
                  </em>
                </div>
              </div>

              {/* Author footer watermark */}
              <div style={{ marginTop: '2rem', textAlign: 'right', fontSize: '12px', color: 'var(--mt)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
                The data visualizations are 100% pitch-perfect. ~Tanish_K
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default App;
