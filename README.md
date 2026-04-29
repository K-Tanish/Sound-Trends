# Spotify Analytics Dashboard (MLM002)

This project contains a standalone HTML dashboard (`spotify_dashboard.html`) that visualizes Spotify audio-feature insights.

The dashboard’s charts load their data from `dashboard_data.js` (a generated file). That file is produced by the Python script `spotify_visualizations.py` using a local dataset CSV.

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

## Generate `dashboard_data.js`

Run the generator (this will create `dashboard_data.js` and several output visual files in the same folder):

```powershell
python spotify_visualizations.py
```

After this finishes, confirm that `dashboard_data.js` exists in the project folder.

## Run the dashboard

### Option A (recommended): serve with a local web server

Start a local server and open the dashboard:

```powershell
python spotify_visualizations.py --serve --open --port 8000
```

Then open:

`http://127.0.0.1:8000/spotify_dashboard.html`

### Option B: open directly in the browser

If `dashboard_data.js` exists, you can open `spotify_dashboard.html` directly in your browser.

Note: serving via HTTP (Option A) avoids potential browser security/CORS quirks with local file loading.

## How it works (quick)

- `spotify_visualizations.py` reads `dataset.csv`, computes aggregates/PCA/correlations, and writes:
  - `dashboard_data.js` containing `window.DASH_DATA`
- `spotify_dashboard.html` reads `window.DASH_DATA` and renders the charts with Chart.js (and D3 for the heatmap).

