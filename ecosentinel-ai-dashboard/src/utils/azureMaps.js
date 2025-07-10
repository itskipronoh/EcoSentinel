// This file contains utility functions for interacting with Azure Maps.

export const initializeMap = (mapContainerId) => {
    const map = new atlas.Map(mapContainerId, {
        center: [36.8219, -1.2921], // Nairobi coordinates
        zoom: 10,
        language: 'en',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY'
        }
    });

    map.events.add('ready', () => {
        console.log('Azure Map is ready');
    });

    return map;
};

export const addMapMarker = (map, coordinates, title) => {
    const marker = new atlas.HtmlMarker({
        position: coordinates,
        text: title,
        color: 'green'
    });

    map.markers.add(marker);
};

export const setMapView = (map, coordinates) => {
    map.setCamera({
        center: coordinates,
        zoom: 12,
        duration: 1000
    });
};