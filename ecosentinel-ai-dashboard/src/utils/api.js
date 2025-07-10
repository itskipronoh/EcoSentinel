// This file contains utility functions for making API calls to fetch environmental data.

const API_BASE_URL = 'https://api.example.com'; // Replace with the actual API base URL

export const fetchAirQualityIndex = async (location) => {
    try {
        const response = await fetch(`${API_BASE_URL}/air-quality?location=${location}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Air Quality Index:', error);
        throw error;
    }
};

export const fetchFloodRisk = async (location) => {
    try {
        const response = await fetch(`${API_BASE_URL}/flood-risk?location=${location}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Flood Risk:', error);
        throw error;
    }
};

// Additional API utility functions can be added here as needed.