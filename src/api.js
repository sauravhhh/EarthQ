export async function fetchEarthquakes() {
  const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  const res = await fetch(url);
  const data = await res.json();
  return data.features.map(f => ({
    id: f.id,
    mag: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    url: f.properties.url
  }));
}