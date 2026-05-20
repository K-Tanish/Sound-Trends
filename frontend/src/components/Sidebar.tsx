import React from 'react';
import styles from '../styles/components/Sidebar.module.css';
import { GENRES, genreColorMap } from '../data/dataLoader';

interface SidebarProps {
  activeTab: 'analysis' | 'tool' | 'conclusions';
  onTabChange: (tab: 'analysis' | 'tool' | 'conclusions', bleedColor: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z" />
          </svg>
        </div>
        <div>
          <div className={styles.logoText}>Sound Trends</div>
          <div className={styles.logoSub}>ANALYTICS</div>
        </div>
      </div>

      <div className={styles.section}>Menu</div>

      <button
        type="button"
        className={`${styles.item} ${activeTab === 'analysis' ? styles.active : ''}`}
        onClick={() => onTabChange('analysis', '#1DB95420')}
        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
        Analysis
      </button>

      <button
        type="button"
        className={`${styles.item} ${activeTab === 'tool' ? styles.active : ''}`}
        onClick={() => onTabChange('tool', '#2e77d020')}
        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
        </svg>
        Playlist Intelligence
      </button>

      <button
        type="button"
        className={`${styles.item} ${activeTab === 'conclusions' ? styles.active : ''}`}
        onClick={() => onTabChange('conclusions', '#7c4dbe20')}
        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        Conclusions
      </button>

      {/* Standalone Link targeting interactive bubble map */}
      <a
        className={styles.item}
        href="/viz7_interactive_bubble.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        Interactive Bubble Map ↗
      </a>

      <div className={styles.divider}></div>
      <div className={styles.section}>Genres</div>

      {GENRES.map((g) => (
        <div key={g} className={styles.item} style={{ fontSize: '12px', padding: '7px 12px', cursor: 'default' }}>
          <div className={styles.dot} style={{ backgroundColor: genreColorMap[g] }}></div>
          {g}
        </div>
      ))}
    </aside>
  );
};
