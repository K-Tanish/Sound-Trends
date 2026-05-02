# Spotify Analytics Dashboard (MLM002)

This project contains a standalone HTML dashboard (`final_dashboard_spotify.html`) that visualizes Spotify audio-feature insights.

The dashboard’s charts load their data from `final_data.js` (generated). The Python script `spotify_visualizations.py` also writes `dashboard_data.js` for backward compatibility.

## Prerequisites

1. **Python 3.9+** (recommended)
2. A **`dataset.csv`** placed in the project folder (`course-project/`).
3. Internet access (the dashboard loads **Chart.js** and **D3** from CDNs).

### `dataset.csv` columns (minimum)

The generator script expects columns including:

`track_id, track_genre, track_name, artists, danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence, popularity, explicit, tempo, loudness, duration_ms`

## Setup (Windows)

Open PowerShell in the project directory:

```powershell
cd "c:\Users\Tanish\Desktop\DV_TUT\course-project"
```

Install required packages (skip `venv`):

```powershell
pip install pandas numpy matplotlib seaborn scikit-learn plotly
```

If you get a permissions error, you can install for your user only:

```powershell
pip install --user pandas numpy matplotlib seaborn scikit-learn plotly
```

## Generate dashboard data files

Run the generator (this will create `final_data.js`, `dashboard_data.js`, and output visual files in the same folder):

```powershell
python spotify_visualizations.py
```

After this finishes, confirm that `final_data.js` exists in the project folder.

## Run the dashboard

### Option A (recommended): serve with a local web server

Start a local server and open the dashboard:

```powershell
python spotify_visualizations.py --serve --open --port 8000
```

Then open:

`http://127.0.0.1:8000/final_dashboard_spotify.html`

### Option B: open directly in the browser

If `final_data.js` exists, you can open `final_dashboard_spotify.html` directly in your browser.

Note: serving via HTTP (Option A) avoids potential browser security/CORS quirks with local file loading.

## How it works (quick)

- `spotify_visualizations.py` reads `dataset.csv`, computes aggregates/PCA/correlations, and writes:
  - `final_data.js` containing `window.FDATA` (used by the current dashboard)
  - `dashboard_data.js` containing `window.DASH_DATA` (legacy compatibility)
- `final_dashboard_spotify.html` reads `window.FDATA` and renders the charts with Chart.js (and D3 for the heatmap).

