// Retrieve the airport data from the script tag
const airports = JSON.parse(document.getElementById('airports-data').textContent);

// Initialize map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Automatically center map on user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Center the map on user's location
            map.setView([latitude, longitude], 12);
            // Add a marker for the user's location
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("<b>Your Location</b><br>You are here!")
                .openPopup();
        },
        (error) => {
            console.error("Error retrieving location: ", error.message);
            alert("Unable to retrieve your location. Please enable location services.");
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Marker cluster layer
const markers = L.markerClusterGroup();
map.addLayer(markers);

// Keep track of the routing control to remove/hide it later
let routingControl = null;

// Helper function: Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Add markers for airports
function addAirportMarkers(airportList) {
    markers.clearLayers();
    airportList.forEach(airport => {
        const marker = L.marker([airport.latitude, airport.longitude])
            .bindPopup(`
                <div class="popup-content">
                    <h3>${airport.name}</h3>
                    <p>${airport.city}, ${airport.country}</p>
                    <div class="popup-buttons">
                        <button class="get-directions-btn" data-lat="${airport.latitude}" data-lng="${airport.longitude}">Get Directions</button>
                        <button class="add-favorite-btn" data-name="${airport.name}" data-city="${airport.city}" data-country="${airport.country}">Add to Favorites</button>
                    </div>
                </div>
            `);
        marker.addTo(markers);
    });

    // Listen for popup open, attach button events
    map.on('popupopen', (e) => {
        const popupElement = e.popup.getElement();

        // "Get Directions" button
        const directionsBtn = popupElement.querySelector('.get-directions-btn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', () => {
                const airportLat = parseFloat(directionsBtn.getAttribute('data-lat'));
                const airportLng = parseFloat(directionsBtn.getAttribute('data-lng'));

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        const userLat = position.coords.latitude;
                        const userLng = position.coords.longitude;

                        // If a route exists, remove it first
                        if (routingControl) {
                            map.removeControl(routingControl);
                        }

                        // Create a new routing control with a custom itinerary container
                        routingControl = L.Routing.control({
                            waypoints: [
                                L.latLng(userLat, userLng),
                                L.latLng(airportLat, airportLng)
                            ],
                            routeWhileDragging: true,
                            itinerary: {
                                container: L.DomUtil.get('directions-container')
                            }
                        }).addTo(map);

                        // Show the directions container
                        const directionsContainer = document.getElementById('directions-container');
                        directionsContainer.style.display = 'block';
                    });
                } else {
                    alert("Geolocation is not supported by your browser.");
                }
            });
        }

        // "Add to Favorites" button
        const addFavBtn = popupElement.querySelector('.add-favorite-btn');
        if (addFavBtn) {
            addFavBtn.addEventListener('click', () => {
                const airportData = {
                    name: addFavBtn.getAttribute('data-name'),
                    city: addFavBtn.getAttribute('data-city'),
                    country: addFavBtn.getAttribute('data-country')
                };
                addFavoriteAirport(airportData);
            });
        }
    });
}

// Populate initial markers
addAirportMarkers(airports);

// Local storage for favorites
function addFavoriteAirport(airport) {
    let favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];
    const alreadyExists = favoriteAirports.some(a =>
        a.name === airport.name &&
        a.city === airport.city &&
        a.country === airport.country
    );

    if (!alreadyExists) {
        favoriteAirports.push(airport);
        localStorage.setItem('favoriteAirports', JSON.stringify(favoriteAirports));
        updateFavoriteAirports();
        alert(`${airport.name} added to your favorites.`);
    } else {
        alert(`${airport.name} is already in your favorites.`);
    }
}

function updateFavoriteAirports() {
    const favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];
    const favoriteList = document.getElementById('favorite-airports-list');
    favoriteList.innerHTML = '';

    if (favoriteAirports.length === 0) {
        favoriteList.innerHTML = '<p>No favorite airports added yet.</p>';
        return;
    }

    favoriteAirports.forEach(a => {
        const li = document.createElement('li');
        li.textContent = `${a.name} - ${a.city}, ${a.country}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => removeFavoriteAirport(a));

        li.appendChild(deleteBtn);
        favoriteList.appendChild(li);
    });
}

function removeFavoriteAirport(airport) {
    let favoriteAirports = JSON.parse(localStorage.getItem('favoriteAirports')) || [];
    favoriteAirports = favoriteAirports.filter(a =>
        !(a.name === airport.name && a.city === airport.city && a.country === airport.country)
    );
    localStorage.setItem('favoriteAirports', JSON.stringify(favoriteAirports));
    updateFavoriteAirports();
}

// Re-center map on user's location
document.getElementById('location-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 12);
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("<b>Your Location</b><br>You are here!")
                .openPopup();
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Find nearest airport
document.getElementById('find-nearest-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            let nearestAirport = { airport: null, distance: Infinity };

            airports.forEach(a => {
                const dist = calculateDistance(userLat, userLng, a.latitude, a.longitude);
                if (dist < nearestAirport.distance) {
                    nearestAirport = { airport: a, distance: dist };
                }
            });

            if (nearestAirport.airport) {
                const { airport, distance } = nearestAirport;
                map.setView([airport.latitude, airport.longitude], 12);
                L.popup()
                    .setLatLng([airport.latitude, airport.longitude])
                    .setContent(`
                        <b>${airport.name}</b><br>
                        ${airport.city}, ${airport.country}<br>
                        Distance: ${distance.toFixed(2)} km
                    `)
                    .openOn(map);
            }
        });
    } else {
        alert("Please allow access to your location to find the nearest airport.");
    }
});

// Toggle Dashboard
document.getElementById('toggle-dashboard-btn').addEventListener('click', () => {
    const overlay = document.getElementById('dashboard-overlay');
    overlay.classList.toggle('active');
    updateFavoriteAirports();
});

// Close Dashboard
document.getElementById('close-dashboard-btn').addEventListener('click', () => {
    document.getElementById('dashboard-overlay').classList.remove('active');
});

// Search Bar with Zoom
document.getElementById('search-airport').addEventListener('input', e => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = airports.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query) ||
        a.country.toLowerCase().includes(query)
    );

    addAirportMarkers(filtered);

    if (filtered.length > 0) {
        map.setView([filtered[0].latitude, filtered[0].longitude], 12);
    }
});

// Close Directions
document.getElementById('close-directions-btn').addEventListener('click', () => {
    const directionsContainer = document.getElementById('directions-container');
    directionsContainer.style.display = 'none';

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
});
