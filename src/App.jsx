import React, { useEffect, useState } from 'react';
import { fetchEarthquakes } from './api';

function App() {
  const [eqs, setEqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarthquakes().then(data => {
      setEqs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">BhumiKamp</h1>
      <p className="text-center mb-6 text-gray-600">Global Earthquakes (last 24 hours)</p>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <ul>
          {eqs.map(eq => (
            <li key={eq.id} className="mb-4 p-3 rounded bg-gray-50 shadow">
              <div>
                <span className="font-semibold">Mag: {eq.mag}</span> — {eq.place}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(eq.time).toLocaleString()} | <a href={eq.url} target="_blank" rel="noopener noreferrer" className="underline">Details</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;