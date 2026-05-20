# Sound Trends — Spotify Analytics & Playlist Curator

An interactive data-science web application exploring Spotify audio patterns, genre fingerprints, and automated playlist compatibility curation.

## Features
1. **The Popularity Myth**: Active scatter plot checking the correlation between danceability and popularity across focus genres.
2. **Feature Correlation Heatmap**: D3-driven interactive matrix plotting Pearson $r$ correlations between acoustic features.
3. **The Sound of Success**: A grouped bar chart tracking top vs bottom quartile feature deltas separating hits from flops. Features an interactive 3D flip card detailing "The Classical Paradox".
4. **Playlist Intelligence Curator**: A curator utility ranking tracks against slider target profiles and genre-specific centroids.

## Architecture
The application has been rebuilt using a modular React + TypeScript architecture:
- **Frontend**: Vite + React + TypeScript + Vanilla CSS Modules.
- **Visuals**: Chart.js (`react-chartjs-2`) for bubble & bar charts; D3.js for SVG heatmap rendering.
- **Data Engineering**: [spotify_visualizations.py](file:///c:/Users/Tanish/Desktop/OPEN_SRC/Sound-Trends/spotify_visualizations.py) processes the raw `dataset.csv` and outputs `final_data.js` containing pre-computed centroids and dimensions.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v10+)

### Installation & Run Dev
1. Navigate into the frontend workspace:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local Vite dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---
*Developed with a pixel-perfect Spotify design language system. Watermark by ~Tanish_K.*

