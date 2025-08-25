# Bhoomikamp

Bhoomikamp is a **minimalistic, mobile-friendly web app** that displays worldwide earthquakes that occurred in the last 24 hours. It presents real-time earthquake data sourced from the USGS Earthquake API, providing essential earthquake details with a clean and user-friendly Design inspired by Material Design and iOS aesthetics.

## Features

- Live earthquake data for the last 24 hours worldwide
- Earthquake magnitude prominently displayed in a large square box
- Location displayed in a concise "City, Country" format
- Detailed information includes depth, date, and time (converted to Indian Standard Time with am/pm)
- Sort earthquakes by:
  - Default (original API order)
  - Magnitude (ascending/descending)
  - Time (oldest first/newest first)
- Refresh button to fetch the latest data instantly
- Responsive, readable UI optimized for mobile and desktop
- Dark-themed buttons with uniform sizing and modern typography

## Screenshot

![Screenshot of Bhoomikamp](screenshot.png)

## Technologies Used

- HTML5, CSS3 (with Flexbox and Google Fonts - Roboto)
- JavaScript (ES6+)
- USGS Earthquake GeoJSON API for live earthquake data

## Usage

1. Open `index.html` in any modern web browser.
2. Click the **Refresh** button to fetch and display the latest earthquake data.
3. Use the **Sort** dropdown to organize earthquakes by magnitude or time.
4. Click **Details** on any earthquake to open the USGS page for more information.

## Data Source

Data is retrieved in real-time from the US Geological Survey (USGS) earthquake feed:  
[https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)

## License

This project is released under the MIT License.

---

Made with ❤️ by Sauravhhh
