import type { Track, FitScoreResult } from '../types';
import { FDATA } from '../data/dataLoader';

interface TargetVibe {
  energy: number;
  danceability: number;
  valence: number;
}

export const useFitScore = () => {
  const calculateFitScore = (track: Track, tgt: TargetVibe): FitScoreResult => {
    // 1. Calculate mood gaps and penalty
    const dE = Math.abs(track.energy - tgt.energy);
    const dD = Math.abs(track.danceability - tgt.danceability);
    const dV = Math.abs(track.valence - tgt.valence);

    const maxGap = Math.max(dE, dD, dV);
    const avgGap = (dE + dD + dV) / 3;

    // Slider fit (sf): stricter penalty for outliers
    const sf = Math.max(0, 1 - (avgGap * 0.8 + maxGap * 0.2));

    // 2. Calculate genre blueprint fit (gf)
    const cent = FDATA.centroids[track.track_genre];
    let gd = 0;

    if (cent) {
      const featureKeys = FDATA.features.length > 0 ? FDATA.features : [
        "danceability", "energy", "speechiness", "acousticness", "instrumentalness", "liveness", "valence"
      ];
      let validFeaturesCount = 0;

      featureKeys.forEach((f) => {
        // Safe property access using indexing
        const trackVal = (track as any)[f];
        const centVal = (cent as any)[f];

        if (trackVal !== undefined && centVal !== undefined) {
          gd += Math.pow(trackVal - centVal, 2);
          validFeaturesCount++;
        }
      });

      if (validFeaturesCount > 0) {
        gd = Math.sqrt(gd / validFeaturesCount);
      }
    }

    const gf = 1 - Math.min(gd, 1);

    // 3. Combined score (Weighted: 70% mood fit vs 30% genre blueprint)
    const combined = sf * 0.7 + gf * 0.3;

    return {
      score: Math.round(combined * 100),
      sliderFit: Math.round(sf * 100),
      genreFit: Math.round(gf * 100),
      gaps: {
        energy: parseFloat((track.energy - tgt.energy).toFixed(3)),
        danceability: parseFloat((track.danceability - tgt.danceability).toFixed(3)),
        valence: parseFloat((track.valence - tgt.valence).toFixed(3))
      }
    };
  };

  const getVibeSummary = (ranked: { t: Track; s: FitScoreResult }[], tgt: TargetVibe) => {
    if (ranked.length === 0) return { text: '', statusColor: '' };

    const avgEnergy = ranked.reduce((acc, curr) => acc + curr.t.energy, 0) / ranked.length;
    const avgMood = ranked.reduce((acc, curr) => acc + curr.t.valence, 0) / ranked.length;

    const energyGap = avgEnergy - tgt.energy;
    const moodGap = avgMood - tgt.valence;

    let text = "This selection is fairly balanced.";
    let statusColor = "rgba(29, 185, 84, 0.1)"; // Spotify green background tint

    if (Math.abs(energyGap) > 0.4) {
      text = `Vibe Mismatch: Your selection is much ${energyGap > 0 ? 'more energetic' : 'quieter'} than your target. It might disrupt the playlist flow.`;
      statusColor = "rgba(241, 94, 107, 0.1)"; // Red tint
    } else if (Math.abs(moodGap) > 0.4) {
      text = `Mood Mismatch: Your songs are significantly ${moodGap > 0 ? 'happier' : 'sadder'} than your target vibe.`;
      statusColor = "rgba(241, 94, 107, 0.1)"; // Red tint
    } else {
      if (avgEnergy > 0.7 && avgMood > 0.6) {
        text = "This is a High-Energy Celebration profile. Perfect for upbeat events, workouts, or party sets.";
      } else if (avgEnergy < 0.4 && avgMood < 0.4) {
        text = "This is a Deep Focus / Mellow profile. Excellent for background study, relaxation, or calm listening.";
      } else if (avgMood > 0.7) {
        text = "This selection has a Feel-Good Vibe. Emotionally bright, positive, and uplifting.";
      }
    }

    return { text, statusColor };
  };

  const getGapInsight = (_track: Track, gaps: FitScoreResult['gaps'], scoreResult: FitScoreResult) => {
    const keys: ('energy' | 'danceability' | 'valence')[] = ['energy', 'danceability', 'valence'];
    const sortedGaps = keys
      .map((k) => ({ k, v: Math.abs(gaps[k]) }))
      .sort((a, b) => b.v - a.v);

    const biggest = sortedGaps[0];

    if (biggest.v < 0.08) {
      return `Strong match — all three target features align closely.`;
    }

    const direction = gaps[biggest.k] > 0 ? 'above' : 'below';
    const label = biggest.k === 'energy'
      ? 'energy level'
      : biggest.k === 'danceability'
        ? 'danceability'
        : 'mood (valence)';

    return `Biggest gap: ${label} is ${Math.abs(gaps[biggest.k]).toFixed(2)} ${direction} your target. Genre blueprint fit: ${scoreResult.genreFit}%.`;
  };

  return {
    calculateFitScore,
    getVibeSummary,
    getGapInsight
  };
};
