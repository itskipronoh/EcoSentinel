/**
 * EcoSentinel AI - Frontend Integration
 * Connects the web interface with the Python ML prediction backend
 */

class EcoSentinelAPI {
    constructor() {
        this.baseURL = '/api'; // Azure Functions endpoint
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get flood risk prediction for a city
     */
    async getFloodRisk(cityName, soilType = 'loam') {
        const cacheKey = `flood_${cityName}_${soilType}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseURL}/predict-flood`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    city_name: cityName,
                    soil_type: soilType,
                    use_real_weather: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error fetching flood prediction:', error);
            return this.getMockFloodData(cityName);
        }
    }

    /**
     * Get air quality prediction
     */
    async getAirQuality(cityName, hoursAhead = 24) {
        const cacheKey = `air_${cityName}_${hoursAhead}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseURL}/predict-air-quality`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    city_name: cityName,
                    hours_ahead: hoursAhead
                })
            });

            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error fetching air quality prediction:', error);
            return this.getMockAirQualityData();
        }
    }

    /**
     * Get deforestation risk analysis
     */
    async getDeforestationRisk(cityName, areaKm2 = 5.0) {
        const cacheKey = `deforestation_${cityName}_${areaKm2}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseURL}/analyze-deforestation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    city_name: cityName,
                    area_km2: areaKm2
                })
            });

            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error fetching deforestation analysis:', error);
            return this.getMockDeforestationData();
        }
    }

    /**
     * Get comprehensive environmental assessment
     */
    async getEnvironmentalAssessment(cityName) {
        try {
            const [floodData, airData, deforestData] = await Promise.all([
                this.getFloodRisk(cityName),
                this.getAirQuality(cityName),
                this.getDeforestationRisk(cityName)
            ]);

            return {
                city: cityName,
                flood_risk: floodData,
                air_quality: airData,
                deforestation: deforestData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching comprehensive assessment:', error);
            return this.getMockComprehensiveData(cityName);
        }
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        return (Date.now() - cached.timestamp) < this.cacheTimeout;
    }

    /**
     * Mock data for offline/fallback scenarios
     */
    getMockFloodData(cityName) {
        return {
            location_info: {
                city_name: cityName,
                country: "Kenya",
                latitude: -1.2921,
                longitude: 36.8219
            },
            risk_score: Math.random() * 0.8 + 0.1,
            risk_level: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
            confidence: 0.87,
            current_weather: {
                temperature: Math.floor(Math.random() * 10) + 20,
                humidity: Math.floor(Math.random() * 30) + 50,
                rainfall_24h: Math.random() * 50,
                weather_text: "Partly Cloudy"
            },
            recommendations: [
                "Monitor weather updates closely",
                "Prepare emergency evacuation kit",
                "Clear drainage around your property"
            ],
            data_source: "Simulated data"
        };
    }

    getMockAirQualityData() {
        const predictions = [];
        let currentAQI = Math.floor(Math.random() * 100) + 80;
        
        for (let i = 0; i < 24; i++) {
            currentAQI += Math.floor(Math.random() * 20) - 10;
            currentAQI = Math.max(50, Math.min(300, currentAQI));
            
            predictions.push({
                timestamp: new Date(Date.now() + i * 3600000).toISOString(),
                aqi: currentAQI,
                category: this.getAQICategory(currentAQI)
            });
        }

        return {
            predictions,
            average_aqi: Math.floor(predictions.reduce((sum, p) => sum + p.aqi, 0) / predictions.length),
            health_recommendations: this.getHealthRecommendations(currentAQI)
        };
    }

    getMockDeforestationData() {
        const riskScore = Math.random() * 0.8 + 0.1;
        return {
            deforestation_risk: riskScore,
            risk_level: riskScore > 0.7 ? "HIGH" : riskScore > 0.4 ? "MEDIUM" : "LOW",
            estimated_tree_loss: Math.floor(5000 * riskScore),
            conservation_actions: [
                "Immediate intervention required",
                "Deploy rapid response conservation team",
                "Monitor with daily satellite imagery"
            ]
        };
    }

    getMockComprehensiveData(cityName) {
        return {
            city: cityName,
            flood_risk: this.getMockFloodData(cityName),
            air_quality: this.getMockAirQualityData(),
            deforestation: this.getMockDeforestationData(),
            timestamp: new Date().toISOString()
        };
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive Groups";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    }

    getHealthRecommendations(aqi) {
        if (aqi <= 50) {
            return ["Air quality is good. Enjoy outdoor activities!"];
        } else if (aqi <= 100) {
            return [
                "Air quality is acceptable for most people",
                "Sensitive individuals should consider limiting prolonged outdoor exertion"
            ];
        } else {
            return [
                "Health warnings of emergency conditions",
                "Everyone should avoid outdoor activities",
                "Stay indoors with windows closed"
            ];
        }
    }
}

// Real-time dashboard updates
class EcoSentinelDashboard {
    constructor() {
        this.api = new EcoSentinelAPI();
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.currentCity = 'Nairobi';
        this.isUpdating = false;
    }

    async initialize() {
        await this.updateDashboard();
        this.startAutoUpdates();
    }

    async updateDashboard() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const assessment = await this.api.getEnvironmentalAssessment(this.currentCity);
            this.updateUI(assessment);
        } catch (error) {
            console.error('Failed to update dashboard:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    updateUI(assessment) {
        // Update status cards
        this.updateStatusCard('floodRisk', assessment.flood_risk.risk_level);
        this.updateStatusCard('airQuality', assessment.air_quality.average_aqi);
        this.updateStatusCard('forestCover', assessment.deforestation.risk_level);
        
        if (assessment.flood_risk.current_weather) {
            this.updateStatusCard('rainfall', assessment.flood_risk.current_weather.rainfall_24h + 'mm');
        }

        // Update prediction banner
        this.updatePredictionBanner(assessment.flood_risk);

        // Update last update time
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();

        // Trigger visual feedback
        this.showUpdateSuccess();
    }

    updateStatusCard(cardId, value) {
        const element = document.getElementById(cardId);
        if (element) {
            element.textContent = value;
            
            // Add color coding
            if (cardId === 'floodRisk' || cardId === 'forestCover') {
                element.style.color = value === 'HIGH' ? '#f44336' : 
                                     value === 'MEDIUM' ? '#ff9800' : '#4caf50';
            } else if (cardId === 'airQuality') {
                const aqi = parseInt(value);
                element.style.color = aqi > 150 ? '#f44336' : 
                                     aqi > 100 ? '#ff9800' : '#4caf50';
            }
        }
    }

    updatePredictionBanner(floodData) {
        const banner = document.querySelector('.prediction-banner');
        const riskLevel = floodData.risk_level;
        const confidence = Math.floor(floodData.confidence * 100);
        const alertIcon = riskLevel === 'HIGH' ? '🚨' : riskLevel === 'MEDIUM' ? '⚠️' : '✅';

        const predictionText = banner.querySelector('.prediction-text');
        if (predictionText) {
            predictionText.innerHTML = `
                <h3>${alertIcon} AI Alert: ${riskLevel} Flood Risk Detected</h3>
                <p>${this.currentCity} - Next 6 hours | Confidence: ${confidence}%</p>
            `;
        }
    }

    showUpdateSuccess() {
        // Flash the live indicator
        const liveDot = document.querySelector('.live-dot');
        if (liveDot) {
            liveDot.style.animation = 'none';
            setTimeout(() => {
                liveDot.style.animation = 'pulse 2s infinite';
            }, 100);
        }
    }

    startAutoUpdates() {
        setInterval(() => {
            this.updateDashboard();
        }, this.updateInterval);
    }

    async changeCityFocus(cityName) {
        this.currentCity = cityName;
        await this.updateDashboard();
    }
}

// Export for global use
window.EcoSentinelAPI = EcoSentinelAPI;
window.EcoSentinelDashboard = EcoSentinelDashboard;

// Auto-initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ecoSentinelDashboard = new EcoSentinelDashboard();
    window.ecoSentinelDashboard.initialize();
});

// Enhanced global functions for UI interactions
window.updatePredictions = async function() {
    if (window.ecoSentinelDashboard) {
        await window.ecoSentinelDashboard.updateDashboard();
    }
};

window.refreshAlerts = async function() {
    if (window.ecoSentinelDashboard) {
        await window.ecoSentinelDashboard.updateDashboard();
    }
};
