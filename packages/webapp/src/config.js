/**
 * EcoSentinel AI - API Endpoint Configuration
 * Maps frontend requests to Azure Functions backend
 */

// API endpoint mappings for EcoSentinel AI Azure Functions
export const API_CONFIG = {
    // Base URL for Azure Functions
    BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-function-app.azurewebsites.net/api'
        : 'http://localhost:7071/api',
    
    // Prediction endpoints
    ENDPOINTS: {
        FLOOD_PREDICTION: '/predict-flood',
        AIR_QUALITY: '/predict-air-quality', 
        DEFORESTATION: '/analyze-deforestation',
        CHAT: '/chats/stream',
        WEATHER_DATA: '/weather-data',
        LOCATION_SEARCH: '/search-location'
    },
    
    // Request configuration
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Cache settings
    CACHE_DURATION: {
        WEATHER: 5 * 60 * 1000,      // 5 minutes
        PREDICTIONS: 10 * 60 * 1000,  // 10 minutes
        LOCATIONS: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // Retry settings
    RETRY_CONFIG: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        EXPONENTIAL_BACKOFF: true
    }
};

// City coordinates for quick lookup
export const CITY_COORDINATES = {
    'Nairobi': { lat: -1.2921, lng: 36.8219, elevation: 1795 },
    'Mombasa': { lat: -4.0435, lng: 39.6682, elevation: 17 },
    'Kisumu': { lat: -0.0917, lng: 34.7680, elevation: 1131 },
    'Nakuru': { lat: -0.3031, lng: 36.0800, elevation: 1850 },
    'Eldoret': { lat: 0.5143, lng: 35.2698, elevation: 2085 },
    'Thika': { lat: -1.0395, lng: 37.0693, elevation: 1631 }
};

// Environmental risk thresholds
export const RISK_THRESHOLDS = {
    FLOOD: {
        LOW: 0.3,
        MEDIUM: 0.4,
        HIGH: 0.7
    },
    AIR_QUALITY: {
        GOOD: 50,
        MODERATE: 100,
        UNHEALTHY_SENSITIVE: 150,
        UNHEALTHY: 200,
        VERY_UNHEALTHY: 300
    },
    DEFORESTATION: {
        LOW: 0.3,
        MEDIUM: 0.4,
        HIGH: 0.7
    }
};

// Color schemes for visualization
export const COLORS = {
    RISK_LEVELS: {
        LOW: '#4caf50',
        MEDIUM: '#ff9800', 
        HIGH: '#f44336'
    },
    CHART_COLORS: {
        FLOOD: '#2196f3',
        AIR_QUALITY: '#ff9800',
        DEFORESTATION: '#4caf50',
        RAINFALL: '#03a9f4',
        TEMPERATURE: '#e91e63'
    }
};

// Default mock data for fallback scenarios
export const MOCK_DATA = {
    CITIES: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    WEATHER_CONDITIONS: [
        'Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'
    ],
    SOIL_TYPES: ['clay', 'loam', 'sand']
};
