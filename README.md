# Sound Trends — A Spotify Analytics Dashboard

## Description
Sound Trends is a web-based dashboard that explores patterns in Spotify music through interactive visualizations.

The project focuses on making data easier to understand by turning it into charts and visual insights. It allows you to see how different musical features like popularity, danceability, energy, and mood (valence) vary across songs and genres.

Along with visualization, the project also includes a playlist intelligence feature designed for curators. Instead of creating playlists directly, you could check if the songs aligned with the overall mood you expect the playlist to be of. The system then evaluates a set of tracks based on their Spotify audio features, ranks them by how well they match the desired mood, and highlights outliers so curators could decide which songs to include or exclude,.

## Tech and Resources Used
- HTML, CSS, JavaScript — for building the interface and interactions
- Chart.js — for creating charts and visual components
- D3.js — for handling data-driven visualizations
- Python — used to process and prepare the dataset
- Spotify dataset (CSV) — includes track-level features like genre, popularity, and audio attributes (obtained from kaggle)

## Working
- The dataset is first cleaned and structured using Python so that it can be used efficiently in the application.
- The processed data is then integrated into the frontend using JavaScript, making it ready for visualization.
- Charts and graphs are generated using Chart.js and D3.js (displayed on the dashboard)
