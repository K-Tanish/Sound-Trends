"""
Spotify Data Visualization Project — MLM002
Dataset: 114,000 tracks across 114 genres
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import argparse
import functools
import http.server
import socketserver
import webbrowser
import json
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import plotly.express as px
import warnings
warnings.filterwarnings("ignore")

# ── Global style ──────────────────────────────────────────────────────────────
plt.rcParams.update({
    "figure.facecolor": "#0d0d0d",
    "axes.facecolor":   "#0d0d0d",
    "axes.edgecolor":   "#333333",
    "axes.labelcolor":  "#cccccc",
    "xtick.color":      "#888888",
    "ytick.color":      "#888888",
    "text.color":       "#cccccc",
    "grid.color":       "#1e1e1e",
    "grid.linewidth":   0.6,
    "font.family":      "DejaVu Sans",
    "font.size":        11,
})

ACCENT_PALETTE = ["#1DB954", "#FF6B6B", "#4FC3F7", "#FFD54F",
                  "#CE93D8", "#80CBC4", "#FFAB91", "#A5D6A7"]

# ── Paths + load data ─────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
OUTPUT_DIR = BASE_DIR

df = pd.read_csv(DATASET_PATH)
df.dropna(inplace=True)
df.drop_duplicates(subset=["track_id"], inplace=True)

AUDIO_FEATURES = ["danceability", "energy", "speechiness",
                  "acousticness", "instrumentalness",
                  "liveness", "valence"]

FOCUS_GENRES = ["pop", "hip-hop", "rock", "jazz",
                "classical", "electronic", "metal", "r-n-b"]

df_focus = df[df["track_genre"].isin(FOCUS_GENRES)].copy()

print(f"Dataset: {len(df):,} tracks | {df['track_genre'].nunique()} genres")


def export_dashboard_data():
    corr_cols = AUDIO_FEATURES + ["popularity", "tempo", "loudness"]
    corr_df = df[corr_cols].corr().round(3)
    corr_labels = corr_df.columns.tolist()
    corr_matrix = corr_df.values.tolist()

    # Chart 1: danceability vs popularity (sampled, by genre)
    scatter_parts = []
    for _, grp in df_focus.groupby("track_genre"):
        scatter_parts.append(grp.sample(min(800, len(grp)), random_state=42))
    scatter_sample = pd.concat(scatter_parts, ignore_index=True)
    scatter_cols = ["track_name", "artists", "track_genre", "danceability", "popularity", "valence", "energy"]
    scatter_data = scatter_sample[scatter_cols].to_dict(orient="records")

    # Chart 2: top vs bottom quartile feature profile within each genre
    compare_features = ["danceability", "energy", "valence", "acousticness", "speechiness", "instrumentalness"]
    sound_success = {"features": compare_features, "genres": FOCUS_GENRES, "top": {}, "bottom": {}, "delta": {}}
    for genre, grp in df_focus.groupby("track_genre"):
        if genre not in FOCUS_GENRES:
            continue
        q25 = grp["popularity"].quantile(0.25)
        q75 = grp["popularity"].quantile(0.75)
        bot = grp[grp["popularity"] <= q25]
        top = grp[grp["popularity"] >= q75]
        top_mean = top[compare_features].mean().fillna(0)
        bot_mean = bot[compare_features].mean().fillna(0)
        sound_success["top"][genre] = {f: round(float(top_mean[f]), 4) for f in compare_features}
        sound_success["bottom"][genre] = {f: round(float(bot_mean[f]), 4) for f in compare_features}
        sound_success["delta"][genre] = {f: round(float(top_mean[f] - bot_mean[f]), 4) for f in compare_features}

    # Chart 3: mood paradox via popularity quartiles -> valence distributions
    mood = {"top_valence": {}, "bottom_valence": {}, "low_vs_high_popularity": {}}
    low_vs_high = {}
    for genre, grp in df_focus.groupby("track_genre"):
        if genre not in FOCUS_GENRES:
            continue
        q25 = grp["popularity"].quantile(0.25)
        q75 = grp["popularity"].quantile(0.75)
        bot = grp.loc[grp["popularity"] <= q25, "valence"].dropna()
        top = grp.loc[grp["popularity"] >= q75, "valence"].dropna()
        mood["bottom_valence"][genre] = [round(float(v), 4) for v in bot.tolist()]
        mood["top_valence"][genre] = [round(float(v), 4) for v in top.tolist()]

        low_val = grp[grp["valence"] <= 0.4]["popularity"].mean()
        high_val = grp[grp["valence"] >= 0.6]["popularity"].mean()
        low_vs_high[genre] = {
            "low_valence_pop": round(float(low_val), 2) if pd.notna(low_val) else None,
            "high_valence_pop": round(float(high_val), 2) if pd.notna(high_val) else None,
            "difference": round(float(low_val - high_val), 2) if pd.notna(low_val) and pd.notna(high_val) else None,
        }
    mood["low_vs_high_popularity"] = low_vs_high

    # Chart 4: PCA genre identity map
    pca_features = AUDIO_FEATURES
    parts = [grp.sample(min(500, len(grp)), random_state=42) for _, grp in df_focus.groupby("track_genre")]
    pca_sample = pd.concat(parts, ignore_index=True).copy()
    X = StandardScaler().fit_transform(pca_sample[pca_features])
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)
    pca_sample["PC1"] = coords[:, 0]
    pca_sample["PC2"] = coords[:, 1]
    ev = pca.explained_variance_ratio_
    pca_points = pca_sample[["track_genre", "PC1", "PC2"]].to_dict(orient="records")

    # Conclusion metrics
    dance_pop_corr = float(df["danceability"].corr(df["popularity"]))
    strongest_pair = ("n/a", "n/a", 0.0)
    for i, a in enumerate(corr_labels):
        for j, b in enumerate(corr_labels):
            if j <= i:
                continue
            v = abs(corr_matrix[i][j])
            if v > strongest_pair[2]:
                strongest_pair = (a, b, v)

    genre_centroids = pca_sample.groupby("track_genre")[["PC1", "PC2"]].mean()
    centroid = genre_centroids.mean()
    distances = ((genre_centroids["PC1"] - centroid["PC1"]) ** 2 + (genre_centroids["PC2"] - centroid["PC2"]) ** 2) ** 0.5
    most_isolated = distances.sort_values(ascending=False).index[0]

    payload = {
        "kpi": {
            "total": int(len(df)),
            "genres": int(df["track_genre"].nunique()),
            "avg_pop": round(float(df["popularity"].mean()), 1),
            "explicit_pct": round(float(df["explicit"].mean() * 100), 1),
        },
        "focus_genres": FOCUS_GENRES,
        "scatter_myth": scatter_data,
        "sound_success": sound_success,
        "mood": mood,
        "corr": {
            "labels": corr_labels,
            "matrix": corr_matrix,
        },
        "pca": {
            "ev": [float(ev[0]), float(ev[1])],
            "points": pca_points,
        },
        "conclusion": {
            "danceability_corr": round(dance_pop_corr, 3),
            "strongest_pair": {
                "a": strongest_pair[0],
                "b": strongest_pair[1],
                "abs_corr": round(float(strongest_pair[2]), 3),
            },
            "most_isolated_genre": most_isolated,
        },
    }

    out_js = OUTPUT_DIR / "dashboard_data.js"
    out_js.write_text("window.DASH_DATA = " + json.dumps(payload, separators=(",", ":")) + ";", encoding="utf-8")
    print("[OK] dashboard_data.js saved")

    # Compatibility payload for final_dashboard_spotify.html
    track_cols = [
        "track_id",
        "track_name",
        "artists",
        "track_genre",
        "popularity",
        "danceability",
        "energy",
        "speechiness",
        "acousticness",
        "instrumentalness",
        "liveness",
        "valence",
    ]
    tracks_payload = df_focus[track_cols].copy()
    tracks_payload = tracks_payload.where(pd.notna(tracks_payload), None)

    feature_for_tool = AUDIO_FEATURES
    centroids = (
        df_focus.groupby("track_genre")[feature_for_tool]
        .mean()
        .reindex(FOCUS_GENRES)
        .fillna(0.0)
        .round(4)
        .to_dict(orient="index")
    )

    final_payload = {
        "genres": FOCUS_GENRES,
        "scatter": scatter_data,
        "feat6": compare_features,
        "delta": sound_success["delta"],
        "corr": payload["corr"],
        "pca": payload["pca"],
        "tracks": tracks_payload.to_dict(orient="records"),
        "centroids": centroids,
        "features": feature_for_tool,
    }
    out_final = OUTPUT_DIR / "final_data.js"
    out_final.write_text("window.FDATA = " + json.dumps(final_payload, separators=(",", ":")) + ";", encoding="utf-8")
    print("[OK] final_data.js saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 1 — Correlation Heatmap  (Unit III)
# ═══════════════════════════════════════════════════════════════════════════════
def viz1_correlation_heatmap():
    fig, ax = plt.subplots(figsize=(10, 8))
    fig.patch.set_facecolor("#0d0d0d")

    num_cols = AUDIO_FEATURES + ["popularity", "tempo", "loudness", "duration_ms"]
    corr = df[num_cols].corr()

    mask = np.triu(np.ones_like(corr, dtype=bool))
    cmap = sns.diverging_palette(10, 145, s=80, l=40, as_cmap=True)

    sns.heatmap(
        corr, mask=mask, cmap=cmap, vmax=1, vmin=-1, center=0,
        annot=True, fmt=".2f", annot_kws={"size": 9, "color": "white"},
        square=True, linewidths=0.5, linecolor="#1e1e1e",
        cbar_kws={"shrink": 0.8, "label": "Pearson r"},
        ax=ax
    )

    ax.set_title("Feature Correlation Heatmap", fontsize=15,
                 fontweight="bold", color="white", pad=15)
    ax.tick_params(colors="#aaaaaa", labelsize=9)
    ax.set_xticklabels(ax.get_xticklabels(), rotation=40, ha="right")
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz1_correlation_heatmap.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz1_correlation_heatmap.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 2 — Genre Audio Fingerprints / Radar Chart  (Unit IV)
# ═══════════════════════════════════════════════════════════════════════════════
def viz2_radar_chart():
    features = ["danceability", "energy", "speechiness",
                "acousticness", "valence", "liveness"]
    N = len(features)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]   # close the polygon

    fig, ax = plt.subplots(figsize=(9, 9), subplot_kw={"polar": True})
    fig.patch.set_facecolor("#0d0d0d")
    ax.set_facecolor("#0d0d0d")

    genre_means = df_focus.groupby("track_genre")[features].mean()

    for i, genre in enumerate(FOCUS_GENRES):
        values = genre_means.loc[genre].tolist()
        values += values[:1]
        ax.plot(angles, values, linewidth=2, color=ACCENT_PALETTE[i], label=genre)
        ax.fill(angles, values, alpha=0.08, color=ACCENT_PALETTE[i])

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(features, size=11, color="white")
    ax.set_yticklabels([])
    ax.set_ylim(0, 1)
    ax.tick_params(colors="#555555")
    ax.spines["polar"].set_color("#333333")
    ax.grid(color="#2a2a2a", linewidth=0.8)

    legend = ax.legend(loc="upper right", bbox_to_anchor=(1.35, 1.15),
                       fontsize=10, framealpha=0,
                       labelcolor="white", handlelength=1.5)

    ax.set_title("Genre Audio Fingerprints", fontsize=15,
                 fontweight="bold", color="white", pad=25)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz2_radar_chart.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz2_radar_chart.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 3 — Valence (Mood) Distribution — Violin Plot  (Unit IV)
# ═══════════════════════════════════════════════════════════════════════════════
def viz3_violin_mood():
    fig, ax = plt.subplots(figsize=(12, 6))

    order = (df_focus.groupby("track_genre")["valence"]
             .median().sort_values().index.tolist())

    parts = ax.violinplot(
        [df_focus[df_focus["track_genre"] == g]["valence"].values for g in order],
        positions=range(len(order)),
        widths=0.7,
        showmedians=True,
        showextrema=False,
    )

    for i, pc in enumerate(parts["bodies"]):
        pc.set_facecolor(ACCENT_PALETTE[i % len(ACCENT_PALETTE)])
        pc.set_alpha(0.6)
        pc.set_edgecolor("white")
        pc.set_linewidth(0.8)

    parts["cmedians"].set_color("white")
    parts["cmedians"].set_linewidth(2)

    ax.set_xticks(range(len(order)))
    ax.set_xticklabels(order, fontsize=11)
    ax.set_ylabel("Valence  (0 = sad  →  1 = happy)", fontsize=11)
    ax.set_title("Mood Distribution Across Genres", fontsize=15,
                 fontweight="bold", color="white", pad=12)
    ax.set_xlim(-0.6, len(order) - 0.4)
    ax.set_ylim(-0.05, 1.05)
    ax.axhline(0.5, color="#444444", linewidth=0.8, linestyle="--")
    ax.text(len(order) - 0.4, 0.52, "neutral", color="#666666",
            fontsize=9, ha="right")
    ax.grid(axis="y", alpha=0.3)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz3_violin_mood.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz3_violin_mood.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 4 — Scatter: Danceability vs Energy  (Unit III)
# ═══════════════════════════════════════════════════════════════════════════════
def viz4_scatter_dance_energy():
    fig, ax = plt.subplots(figsize=(11, 7))

    parts = [grp.sample(min(200, len(grp)), random_state=42)
             for _, grp in df_focus.groupby("track_genre")]
    sample = pd.concat(parts, ignore_index=True)

    for i, genre in enumerate(FOCUS_GENRES):
        g = sample[sample["track_genre"] == genre]
        sc = ax.scatter(
            g["danceability"], g["energy"],
            c=ACCENT_PALETTE[i], s=g["popularity"] * 0.4 + 5,
            alpha=0.55, label=genre, edgecolors="none"
        )

    ax.set_xlabel("Danceability", fontsize=12)
    ax.set_ylabel("Energy", fontsize=12)
    ax.set_title("Danceability vs Energy  (size = popularity)",
                 fontsize=15, fontweight="bold", color="white", pad=12)

    legend = ax.legend(framealpha=0, labelcolor="white",
                       fontsize=10, loc="lower right",
                       handletextpad=0.4, borderpad=0.6)

    # Size reference legend
    for size, label in [(10, "low pop"), (35, "mid"), (65, "high pop")]:
        ax.scatter([], [], c="#555555", s=size * 0.4 + 5,
                   label=label, alpha=0.7)
    ax.legend(framealpha=0, labelcolor="#aaaaaa", fontsize=9,
              loc="upper left", title="Popularity", title_fontsize=9,
              handles=legend.legend_handles +
              [mpatches.Patch(color="#555555", label=l)
               for l in ["low", "mid", "high"]])

    ax.grid(alpha=0.15)
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz4_scatter_dance_energy.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz4_scatter_dance_energy.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 5 — KMeans + PCA Cluster Map  (Unit V)
# ═══════════════════════════════════════════════════════════════════════════════
def viz5_pca_clusters():
    parts = [grp.sample(min(300, len(grp)), random_state=42)
             for _, grp in df_focus.groupby("track_genre")]
    sample = pd.concat(parts, ignore_index=True).copy()

    X = StandardScaler().fit_transform(sample[AUDIO_FEATURES])
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)
    sample["PC1"] = coords[:, 0]
    sample["PC2"] = coords[:, 1]

    ev = pca.explained_variance_ratio_
    km = KMeans(n_clusters=8, random_state=42, n_init=10)
    sample["cluster"] = km.fit_predict(X)

    fig, ax = plt.subplots(figsize=(11, 8))

    for i, genre in enumerate(FOCUS_GENRES):
        g = sample[sample["track_genre"] == genre]
        ax.scatter(g["PC1"], g["PC2"],
                   c=ACCENT_PALETTE[i], s=18, alpha=0.65,
                   label=genre, edgecolors="none")

    # Cluster centroids projected
    c_proj = pca.transform(km.cluster_centers_)
    ax.scatter(c_proj[:, 0], c_proj[:, 1],
               marker="X", s=120, c="white", zorder=5,
               edgecolors="#0d0d0d", linewidths=0.8, label="centroid")

    ax.set_xlabel(f"PC1  ({ev[0]*100:.1f}% variance)", fontsize=11)
    ax.set_ylabel(f"PC2  ({ev[1]*100:.1f}% variance)", fontsize=11)
    ax.set_title("Genre Clusters — PCA + K-Means (k=8)",
                 fontsize=15, fontweight="bold", color="white", pad=12)
    ax.legend(framealpha=0, labelcolor="white", fontsize=10,
              loc="upper right", ncol=2)
    ax.grid(alpha=0.12)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz5_pca_clusters.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz5_pca_clusters.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 6 — Top-genre popularity + feature bar summary  (Unit III + VI)
# ═══════════════════════════════════════════════════════════════════════════════
def viz6_genre_popularity_bars():
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Left — avg popularity per focus genre
    pop = (df_focus.groupby("track_genre")["popularity"]
           .mean().reindex(FOCUS_GENRES).sort_values(ascending=True))

    bars = axes[0].barh(pop.index, pop.values,
                        color=ACCENT_PALETTE[:len(pop)],
                        edgecolor="none", height=0.6)
    axes[0].set_xlabel("Average Popularity Score", fontsize=11)
    axes[0].set_title("Avg Popularity by Genre", fontsize=13,
                      fontweight="bold", color="white", pad=10)
    for bar, val in zip(bars, pop.values):
        axes[0].text(val + 0.3, bar.get_y() + bar.get_height() / 2,
                     f"{val:.1f}", va="center", fontsize=9, color="white")
    axes[0].grid(axis="x", alpha=0.2)
    axes[0].set_xlim(0, pop.max() + 8)

    # Right — avg feature radar collapsed to bar
    feat_means = df_focus.groupby("track_genre")[
        ["danceability", "energy", "valence", "acousticness"]
    ].mean().reindex(FOCUS_GENRES)

    x = np.arange(len(FOCUS_GENRES))
    width = 0.2
    feat_colors = ["#1DB954", "#FF6B6B", "#FFD54F", "#4FC3F7"]
    feat_labels = ["danceability", "energy", "valence", "acousticness"]

    for j, (feat, col) in enumerate(zip(feat_labels, feat_colors)):
        axes[1].bar(x + j * width, feat_means[feat],
                    width=width, color=col, alpha=0.85,
                    label=feat, edgecolor="none")

    axes[1].set_xticks(x + width * 1.5)
    axes[1].set_xticklabels(FOCUS_GENRES, rotation=30, ha="right", fontsize=10)
    axes[1].set_ylabel("Average Score (0–1)", fontsize=11)
    axes[1].set_title("Audio Feature Comparison by Genre", fontsize=13,
                      fontweight="bold", color="white", pad=10)
    axes[1].legend(framealpha=0, labelcolor="white", fontsize=9,
                   loc="upper right")
    axes[1].grid(axis="y", alpha=0.2)
    axes[1].set_ylim(0, 1.05)

    fig.suptitle("Genre Performance Dashboard", fontsize=16,
                 fontweight="bold", color="white", y=1.01)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz6_genre_bars.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz6_genre_bars.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 7 — Plotly Interactive Bubble Chart  (Unit III dynamic)
# ═══════════════════════════════════════════════════════════════════════════════
def viz7_plotly_bubble():
    parts = [grp.sample(min(150, len(grp)), random_state=42)
             for _, grp in df_focus.groupby("track_genre")]
    sample = pd.concat(parts, ignore_index=True).copy()

    # Bin popularity for bubble sizing
    sample["pop_size"] = sample["popularity"].clip(lower=5)

    fig = px.scatter(
        sample,
        x="danceability",
        y="energy",
        size="pop_size",
        color="track_genre",
        hover_name="track_name",
        hover_data={"artists": True, "popularity": True,
                    "valence": ":.2f", "pop_size": False},
        color_discrete_sequence=ACCENT_PALETTE,
        size_max=28,
        opacity=0.75,
        title="Danceability vs Energy — Interactive Bubble Chart",
        labels={
            "danceability": "Danceability",
            "energy": "Energy",
            "track_genre": "Genre",
        },
    )

    fig.update_layout(
        plot_bgcolor="#0d0d0d",
        paper_bgcolor="#0d0d0d",
        font_color="#cccccc",
        title_font_size=17,
        title_font_color="white",
        legend_title_text="Genre",
        xaxis=dict(gridcolor="#1e1e1e", range=[0, 1]),
        yaxis=dict(gridcolor="#1e1e1e", range=[0, 1]),
        hoverlabel=dict(bgcolor="#1e1e1e", font_color="white"),
    )

    fig.write_html(OUTPUT_DIR / "viz7_interactive_bubble.html")
    print("[OK] viz7_interactive_bubble.html saved")


# ═══════════════════════════════════════════════════════════════════════════════
# VIZ 8 — Popularity distribution by explicit vs clean  (Unit III histogram)
# ═══════════════════════════════════════════════════════════════════════════════
def viz8_explicit_popularity():
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    # Left — overlapping histograms
    for explicit, color, label in [
        (False, "#4FC3F7", "Clean"),
        (True,  "#FF6B6B", "Explicit"),
    ]:
        axes[0].hist(
            df[df["explicit"] == explicit]["popularity"],
            bins=40, alpha=0.6, color=color, label=label,
            edgecolor="none", density=True
        )

    axes[0].set_xlabel("Popularity Score", fontsize=11)
    axes[0].set_ylabel("Density", fontsize=11)
    axes[0].set_title("Popularity: Explicit vs Clean Tracks",
                      fontsize=13, fontweight="bold", color="white", pad=10)
    axes[0].legend(framealpha=0, labelcolor="white", fontsize=10)
    axes[0].grid(alpha=0.2)

    # Right — genre explicit rate
    exp_rate = (df_focus.groupby("track_genre")["explicit"]
                .mean().mul(100).sort_values(ascending=False))

    bars = axes[1].bar(exp_rate.index, exp_rate.values,
                       color=[ACCENT_PALETTE[FOCUS_GENRES.index(g)]
                               for g in exp_rate.index],
                       edgecolor="none", width=0.6)

    axes[1].set_ylabel("Explicit track %", fontsize=11)
    axes[1].set_xticklabels(exp_rate.index, rotation=30, ha="right", fontsize=10)
    axes[1].set_title("Explicit Content Rate by Genre",
                      fontsize=13, fontweight="bold", color="white", pad=10)
    axes[1].grid(axis="y", alpha=0.2)
    axes[1].set_ylim(0, exp_rate.max() + 8)

    for bar, val in zip(bars, exp_rate.values):
        axes[1].text(bar.get_x() + bar.get_width() / 2, val + 0.5,
                     f"{val:.0f}%", ha="center", fontsize=9, color="white")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "viz8_explicit_popularity.png",
                dpi=150, bbox_inches="tight", facecolor="#0d0d0d")
    plt.close()
    print("[OK] viz8_explicit_popularity.png saved")


# ═══════════════════════════════════════════════════════════════════════════════
# RUN ALL
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import os
    parser = argparse.ArgumentParser(description="Generate Spotify visualizations")
    parser.add_argument("--serve", action="store_true", help="Serve dashboard on localhost after generation")
    parser.add_argument("--open", action="store_true", dest="open_browser", help="Open dashboard URL in default browser")
    parser.add_argument("--port", type=int, default=8000, help="Port for local HTTP server (default: 8000)")
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("\n-- Running all visualizations --\n")
    viz1_correlation_heatmap()
    viz2_radar_chart()
    viz3_violin_mood()
    viz4_scatter_dance_energy()
    viz5_pca_clusters()
    viz6_genre_popularity_bars()
    viz7_plotly_bubble()
    viz8_explicit_popularity()
    export_dashboard_data()
    print(f"\n[OK] All 8 visualizations saved to {OUTPUT_DIR}/")

    if args.serve:
        dashboard_candidates = [
            OUTPUT_DIR / "final_dashboard_spotify.html",
            OUTPUT_DIR / "spotify_dashboard.html",
        ]
        dashboard_path = next((p for p in dashboard_candidates if p.exists()), dashboard_candidates[0])
        dashboard_url = f"http://127.0.0.1:{args.port}/{dashboard_path.name}"
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(OUTPUT_DIR))
        with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
            print(f"[OK] Dashboard server running at {dashboard_url}")
            if args.open_browser:
                webbrowser.open(dashboard_url)
                print("[OK] Opened dashboard in browser")
            print("[INFO] Press Ctrl+C to stop server")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n[OK] Server stopped")
