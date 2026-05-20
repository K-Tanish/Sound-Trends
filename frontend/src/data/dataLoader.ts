import type { FDATAStructure } from '../types';

// Declare global window interface extension
declare global {
  interface Window {
    FDATA?: FDATAStructure;
  }
}

// Safely retrieve FDATA from window, providing fallback dummy data to prevent compiler/runtime crashes if it's missing
export const FDATA: FDATAStructure = window.FDATA || {
  genres: [],
  scatter: [],
  feat6: [],
  delta: {},
  corr: { labels: [], matrix: [] },
  pca: { ev: [0, 0], points: [] },
  tracks: [],
  centroids: {},
  features: []
};

export const GENRES = FDATA.genres.length > 0 ? FDATA.genres : [
  "pop", "hip-hop", "rock", "jazz", "classical", "electronic", "metal", "r-n-b"
];

export const COLORS = [
  '#1DB954', // pop -> Spotify green
  '#f15e6b', // hip-hop -> red-pink
  '#2e77d0', // rock -> blue
  '#e8a723', // jazz -> orange
  '#7c4dbe', // classical -> purple
  '#00b4b4', // electronic -> cyan
  '#e05f8e', // metal -> magenta
  '#3dba8a'  // r-n-b -> teal-green
];

export const genreColorMap: { [genre: string]: string } = {};
GENRES.forEach((g, i) => {
  genreColorMap[g] = COLORS[i % COLORS.length];
});
