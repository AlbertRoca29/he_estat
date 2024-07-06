const map = L.map('map', {
    minZoom: 2, // Minimum zoom level
    maxZoom: 5, // Maximum zoom level for better control
    maxBounds: [
        [-90, -180], // South-West coordinates
        [90, 180]    // North-East coordinates
    ],
    maxBoundsViscosity: 1.0 // Ensures the map stays within bounds
}).setView([20, 0], 2); // Initial view centered on the equator

const visitedCountries = new Set(); // Store visited countries in a Set

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true // Prevents the map from repeating horizontally
}).addTo(map);

// Load GeoJSON data for countries and render them on the map
let geojsonLayer;
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJson(data, {
            style: styleCountry,
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Style each country based on whether it's visited
function styleCountry(feature) {
    return {
        fillColor: visitedCountries.has(feature.properties.name) ? 'green' : '#D3D3D3',
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// Function to handle events on each country
function onEachFeature(feature, layer) {
    layer.on({
        click: () => addCountryByName(feature.properties.name)
    });
}

// Add a country by its name and update the map
function addCountry() {
    const countryName = document.getElementById('countryName').value.trim();
    addCountryByName(countryName);
}

function addCountryByName(countryName) {
    if (!countryName) return;
    visitedCountries.add(countryName);
    updateMap();
    saveUserData();
}

// Update the map styles based on visited countries
function updateMap() {
    geojsonLayer.setStyle(styleCountry);
}

// Save user data to the backend
async function saveUserData() {
    const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user1', visitedCountries: Array.from(visitedCountries) })
    });
    if (response.ok) {
        console.log('User data saved');
    } else {
        console.error('Error saving user data');
    }
}

// Load user data from the backend on page load
async function loadUserData() {
    const response = await fetch('/api/user-data?userId=user1');
    if (response.ok) {
        const userData = await response.json();
        userData.visitedCountries.forEach(country => visitedCountries.add(country));
        updateMap();
    } else {
        console.error('Error loading user data');
    }
}

// Load user data when the page loads
window.onload = loadUserData;
