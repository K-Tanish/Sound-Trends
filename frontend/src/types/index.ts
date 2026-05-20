export interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  track_genre: string;
  popularity: number;
  danceability: number;
  energy: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
}

export interface CentroidFeatures {
  danceability: number;
  energy: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  [key: string]: number;
}

export interface GenreCentroids {
  [genreName: string]: CentroidFeatures;
}

export interface ScatterPoint {
  track_name: string;
  artists: string;
  track_genre: string;
  danceability: number;
  popularity: number;
  valence: number;
  energy: number;
}

export interface SuccessDelta {
  [genreName: string]: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    speechiness: number;
    instrumentalness: number;
    [feature: string]: number;
  };
}

export interface CorrelationData {
  labels: string[];
  matrix: number[][];
}

export interface PCAData {
  ev: [number, number];
  points: {
    track_genre: string;
    PC1: number;
    PC2: number;
  }[];
}

export interface FDATAStructure {
  genres: string[];
  scatter: ScatterPoint[];
  feat6: string[];
  delta: SuccessDelta;
  corr: CorrelationData;
  pca: PCAData;
  tracks: Track[];
  centroids: GenreCentroids;
  features: string[];
}

export interface FitScoreResult {
  score: number;
  sliderFit: number;
  genreFit: number;
  gaps: {
    energy: number;
    danceability: number;
    valence: number;
  };
}
