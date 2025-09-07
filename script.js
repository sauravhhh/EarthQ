// script.js
// Global variables
let earthquakeData = [];
let map;
let markers = [];

// Helper function to convert UTC time to IST (Indian Standard Time)
function convertToIST(utcTime) {
    const date = new Date(utcTime);
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(date.getTime() + istOffset + date.getTimezoneOffset() * 60 * 1000);
    
    // Format time with AM/PM
    let hours = istTime.getHours();
    const minutes = istTime.getMinutes().toString().padStart(2, '0');
    const seconds = istTime.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes}:${seconds} ${ampm}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app');
    initializeTabs();
    fetchEarthquakeData();
    
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', fetchEarthquakeData);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
});

// Tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('tab-active'));
            this.classList.add('tab-active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                if (content.id === tabName + 'View') {
                    content.classList.remove('hidden');
                    if (tabName === 'map' && !map) {
                        initializeMap();
                    } else if (tabName === 'map' && map) {
                        setTimeout(() => map.invalidateSize(), 100);
                    }
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

// Fetch earthquake data from USGS API
async function fetchEarthquakeData() {
    const timeFilter = document.getElementById('timeFilter').value;
    const apiUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${timeFilter}.geojson`;
    
    console.log('Fetching data from:', apiUrl);
    
    // Show loading state
    document.getElementById('earthquakeList').innerHTML = `
        <div class="flex justify-center items-center py-8">
            <div class="loading-spinner"></div>
        </div>
    `;
    
    try {
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Check if data has features
        if (!data.features || !Array.isArray(data.features)) {
            throw new Error('Invalid data format: features array missing');
        }
        
        earthquakeData = data.features;
        console.log('Earthquake data set, length:', earthquakeData.length);
        
        updateStats();
        renderEarthquakeList();
        updateMapMarkers();
        
        // Update last updated time in IST
        const now = new Date();
        document.getElementById('lastUpdated').textContent = convertToIST(now.getTime());
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        document.getElementById('earthquakeList').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                <p>Failed to load earthquake data. Please try again.</p>
                <p class="text-sm mt-2">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    console.log('Updating stats with data length:', earthquakeData.length);
    const totalCount = earthquakeData.length;
    const significantCount = earthquakeData.filter(eq => eq.properties.mag >= 4.0).length;
    const majorCount = earthquakeData.filter(eq => eq.properties.mag >= 5.0).length;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('significantCount').textContent = significantCount;
    document.getElementById('majorCount').textContent = majorCount;
}

// Render earthquake list
function renderEarthquakeList() {
    console.log('Rendering earthquake list, data length:', earthquakeData.length);
    const listContainer = document.getElementById('earthquakeList');
    const magnitudeFilter = parseFloat(document.getElementById('magnitudeFilter').value);
    
    let filteredData = earthquakeData;
    if (magnitudeFilter) {
        filteredData = earthquakeData.filter(eq => eq.properties.mag >= magnitudeFilter);
    }
    console.log('Filtered data length:', filteredData.length);
    
    if (filteredData.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-search text-3xl mb-2"></i>
                <p>No earthquakes found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filteredData.map(earthquake => {
        const props = earthquake.properties;
        const coords = earthquake.geometry.coordinates;
        const magnitude = props.mag;
        const time = new Date(props.time);
        
        // Determine magnitude color
        let magnitudeColor = 'bg-green-500';
        if (magnitude >= 5.0) magnitudeColor = 'bg-red-500';
        else if (magnitude >= 4.0) magnitudeColor = 'bg-orange-500';
        
        // Format depth
        const depth = coords[2].toFixed(1);
        let depthCategory = 'Shallow';
        if (depth > 300) depthCategory = 'Deep';
        else if (depth > 70) depthCategory = 'Intermediate';
        
        return `
            <div class="earthquake-item bg-white border rounded-lg p-4 cursor-pointer" onclick="showEarthquakeDetail('${earthquake.id}')">
                <div class="flex items-start">
                    <div class="magnitude-badge ${magnitudeColor} text-white rounded px-2 py-1 mr-3">
                        ${magnitude.toFixed(1)}
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold">${props.place || 'Unknown Location'}</h3>
                        <div class="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                            <span><i class="far fa-clock mr-1"></i>${convertToIST(props.time)}</span>
                            <span><i class="fas fa-ruler-vertical mr-1"></i>${depth} km (${depthCategory})</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize map
function initializeMap() {
    console.log('Initializing map');
    map = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    updateMapMarkers();
}

// Update map markers
function updateMapMarkers() {
    console.log('Updating map markers, data length:', earthquakeData.length);
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    earthquakeData.forEach(earthquake => {
        const props = earthquake.properties;
        const coords = earthquake.geometry.coordinates;
        const magnitude = props.mag;
        
        // Determine marker color based on magnitude
        let markerColor = '#10b981'; // green
        if (magnitude >= 5.0) markerColor = '#ef4444'; // red
        else if (magnitude >= 4.0) markerColor = '#f97316'; // orange
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const marker = L.marker([coords[1], coords[0]], { icon })
            .addTo(map)
            .bindPopup(`
                <div class="p-2">
                    <h3 class="font-bold">${props.place || 'Unknown Location'}</h3>
                    <p><strong>Magnitude:</strong> ${magnitude.toFixed(1)}</p>
                    <p><strong>Depth:</strong> ${coords[2].toFixed(1)} km</p>
                    <p><strong>Time:</strong> ${convertToIST(props.time)}</p>
                </div>
            `);
        
        markers.push(marker);
    });
}

// Apply filters
function applyFilters() {
    console.log('Applying filters');
    renderEarthquakeList();
}

// Show earthquake detail (placeholder for future enhancement)
function showEarthquakeDetail(earthquakeId) {
    console.log('Showing earthquake detail for:', earthquakeId);
    const earthquake = earthquakeData.find(eq => eq.id === earthquakeId);
    if (!earthquake) return;
    
    const props = earthquake.properties;
    const coords = earthquake.geometry.coordinates;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-xl font-bold">Earthquake Details</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div>
                        <h3 class="text-sm text-gray-500">Location</h3>
                        <p class="font-medium">${props.place || 'Unknown Location'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-500">Magnitude</h3>
                        <p class="font-medium text-2xl">${props.mag.toFixed(1)}</p>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-500">Depth</h3>
                        <p class="font-medium">${coords[2].toFixed(1)} km</p>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-500">Time (IST)</h3>
                        <p class="font-medium">${convertToIST(props.time)}</p>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-500">Coordinates</h3>
                        <p class="font-medium">${coords[1].toFixed(4)}°, ${coords[0].toFixed(4)}°</p>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-500">More Information</h3>
                        <a href="${props.url}" target="_blank" class="text-blue-500 hover:underline">
                            View on USGS <i class="fas fa-external-link-alt text-xs"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
                 }
