// Retrieve the airport data from the script tag
const airports = JSON.parse(document.getElementById('airports-data').textContent);

// Initialize map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
map.addLayer(markers);

// Utility: Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get user location
let userLat, userLng;
async function getUserLocation() {
    const locationLoadingMessage = L.popup()
        .setLatLng(map.getCenter())
        .setContent("Retrieving your location...")
        .openOn(map);

    if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    map.closePopup(locationLoadingMessage);
                    userLat = position.coords.latitude;
                    userLng = position.coords.longitude;
                    map.setView([userLat, userLng], 12);
                    L.marker([userLat, userLng])
                        .addTo(map)
                        .bindPopup("<b>Your Location</b><br>You are here!")
                        .openPopup();
                    resolve();
                },
                error => {
                    map.closePopup(locationLoadingMessage);
                    console.error("Geolocation error:", error);
                    alert("Could not retrieve your location.");
                    reject();
                }
            );
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}
getUserLocation();

// Helper: Add airport markers
function addAirportMarkers(airportList) {
    markers.clearLayers();
    airportList.forEach(airport => {
        const marker = L.marker([airport.latitude, airport.longitude])
            .bindPopup(`<b>${airport.name}</b><br>${airport.city}, ${airport.country}`)
            .addTo(markers);

        // Add event listener for the marker to ask the user if they want to add it to favorites
        marker.on('click', function () {
            const isConfirmed = confirm(`Do you want to add ${airport.name} to your favorites?`);
            if (isConfirmed) {
                addFavoriteAirport({
                    name: airport.name,
                    city: airport.city,
                    country: airport.country
                });
            }
        });
    });
}

// Add all airport markers initially
addAirportMarkers(airports);

// Add airport to favorites in localStorage
function addFavoriteAirport(airport) {
    let favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];

    // Check if the airport is already in favorites
    const airportExists = favoriteAirports.some(fav =>
        fav.name === airport.name && fav.city === airport.city && fav.country === airport.country
    );

    if (!airportExists) {
        // Add the airport to the list of favorites
        favoriteAirports.push({
            name: airport.name,
            city: airport.city,
            country: airport.country
        });

        // Save the updated favorite airports to localStorage
        localStorage.setItem('favoriteAirports', JSON.stringify(favoriteAirports));
        updateFavoriteAirports();  // Update dashboard list after adding
    } else {
        alert(`${airport.name} is already in your favorites.`);
    }
}

// Remove airport from favorites in localStorage
function removeFavoriteAirport(airport) {
    let favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];

    // Filter out the airport to remove it
    favoriteAirports = favoriteAirports.filter(fav =>
        !(fav.name === airport.name && fav.city === airport.city && fav.country === airport.country)
    );

    // Save the updated favorites back to localStorage
    localStorage.setItem('favoriteAirports', JSON.stringify(favoriteAirports));
    updateFavoriteAirports();  // Update dashboard list after removal
    alert(`${airport.name} has been removed from your favorites.`);
}

// Update the favorite airports section in the dashboard
function updateFavoriteAirports() {
    const favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];
    const favoriteList = document.getElementById('favorite-airports-list');
    favoriteList.innerHTML = ''; // Clear current list

    if (favoriteAirports.length === 0) {
        favoriteList.innerHTML = '<p>No favorite airports added yet.</p>';
        return;
    }

    favoriteAirports.forEach(airport => {
        const listItem = document.createElement('li');
        listItem.textContent = `${airport.name} - ${airport.city}, ${airport.country}`;

        // Add a delete button for each airport
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn'); // Add styling class
        deleteButton.addEventListener('click', () => removeFavoriteAirport(airport));

        listItem.appendChild(deleteButton);
        favoriteList.appendChild(listItem);
    });
}

// Find nearest airport
document.getElementById('find-nearest-btn').addEventListener('click', () => {
    if (userLat && userLng) {
        let nearestAirport = airports.reduce((nearest, airport) => {
            const distance = calculateDistance(userLat, userLng, airport.latitude, airport.longitude);
            return distance < nearest.distance ? { airport, distance } : nearest;
        }, { airport: null, distance: Infinity });

        if (nearestAirport.airport) {
            const { airport, distance } = nearestAirport;
            L.popup()
                .setLatLng([airport.latitude, airport.longitude])
                .setContent(`<b>${airport.name}</b><br>${airport.city}, ${airport.country}<br>Distance: ${distance.toFixed(2)} km`)
                .openOn(map);
        }
    } else {
        alert("Please allow access to your location to find the nearest airport.");
    }
});

// Center map on user's location
document.getElementById('location-btn').addEventListener('click', () => {
    if (userLat && userLng) map.setView([userLat, userLng], 12);
});

// Toggle dashboard visibility
document.getElementById('toggle-dashboard-btn').addEventListener('click', () => {
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    dashboardOverlay.classList.add('active');
    updateFavoriteAirports();  // Update dashboard with the latest favorites
});

// Close the dashboard
document.getElementById('close-dashboard-btn').addEventListener('click', () => {
    console.log('Close button clicked');
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    dashboardOverlay.classList.remove('active');
});

// Search functionality for airports
document.getElementById('search-airport').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filteredAirports = airports.filter(airport =>
        airport.name.toLowerCase().includes(query) ||
        airport.city.toLowerCase().includes(query)
    );
    addAirportMarkers(filteredAirports);
});
