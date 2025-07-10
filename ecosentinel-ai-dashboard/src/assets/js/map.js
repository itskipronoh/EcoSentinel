// src/assets/js/map.js

const mapContainer = document.getElementById('mapContainer');

function initializeMap() {
    const map = new atlas.Map('mapContainer', {
        center: [36.8219, -1.2921], // Nairobi coordinates
        zoom: 10,
        language: 'en',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY'
        }
    });

    map.events.add('ready', () => {
        addMapControls(map);
        loadEnvironmentalData();
    });
}

function addMapControls(map) {
    const zoomControl = new atlas.control.ZoomControl();
    map.controls.add(zoomControl, {
        position: 'top-right'
    });
}

function loadEnvironmentalData() {
    // Fetch environmental data from the API and display it on the map
    fetch('/api/environmental-data')
        .then(response => response.json())
        .then(data => {
            // Process and display data on the map
            data.forEach(item => {
                const marker = new atlas.HtmlMarker({
                    position: [item.longitude, item.latitude],
                    popup: new atlas.Popup({
                        content: `<div><strong>${item.title}</strong><p>${item.description}</p></div>`
                    })
                });
                marker.setMap(map);
            });
        })
        .catch(error => console.error('Error loading environmental data:', error));
}

document.addEventListener('DOMContentLoaded', initializeMap);