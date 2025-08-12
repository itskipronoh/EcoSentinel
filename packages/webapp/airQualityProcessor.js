// Air Quality Data Processor for EcoSentinel Dashboard

class AirQualityProcessor {
    constructor() {
        this.airQualityData = [];
        this.sensorLocations = new Map();
        this.currentData = null;
    }

    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(';');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(';');
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        return data;
    }

    // Process air quality data for visualization
    processAirQualityData(data) {
        const processedData = new Map();

        data.forEach(row => {
            const key = `${row.lat}_${row.lon}`;
            
            if (!processedData.has(key)) {
                processedData.set(key, {
                    sensor_id: row.sensor_id,
                    lat: parseFloat(row.lat),
                    lon: parseFloat(row.lon),
                    location: row.location,
                    measurements: {},
                    latest_timestamp: row.timestamp
                });
            }

            const location = processedData.get(key);
            
            // Store the latest measurement for each value type
            if (!location.measurements[row.value_type] || 
                new Date(row.timestamp) > new Date(location.latest_timestamp)) {
                location.measurements[row.value_type] = {
                    value: parseFloat(row.value),
                    timestamp: row.timestamp,
                    sensor_type: row.sensor_type
                };
            }
        });

        return Array.from(processedData.values());
    }

    // Calculate Air Quality Index (AQI) from PM2.5 values
    calculateAQI(pm25) {
        if (pm25 <= 12) return { aqi: Math.round((50/12) * pm25), level: 'Good', color: '#00e400' };
        if (pm25 <= 35.4) return { aqi: Math.round(50 + ((100-50)/(35.4-12.1)) * (pm25-12.1)), level: 'Moderate', color: '#ffff00' };
        if (pm25 <= 55.4) return { aqi: Math.round(101 + ((150-101)/(55.4-35.5)) * (pm25-35.5)), level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' };
        if (pm25 <= 150.4) return { aqi: Math.round(151 + ((200-151)/(150.4-55.5)) * (pm25-55.5)), level: 'Unhealthy', color: '#ff0000' };
        if (pm25 <= 250.4) return { aqi: Math.round(201 + ((300-201)/(250.4-150.5)) * (pm25-150.5)), level: 'Very Unhealthy', color: '#8f3f97' };
        return { aqi: Math.round(301 + ((500-301)/(500.4-250.5)) * (pm25-250.5)), level: 'Hazardous', color: '#7e0023' };
    }

    // Get risk level based on AQI
    getRiskLevel(aqi) {
        if (aqi <= 50) return 'low';
        if (aqi <= 100) return 'moderate';
        return 'high';
    }

    // Load and process air quality data from CSV files
    async loadAirQualityData() {
        try {
            const dataFiles = [
                'assets/Datasets/Air pollution/tmp97hnt0jx.csv',
                'assets/Datasets/Air pollution/september_2019_sensor_data_archive.csv',
                'assets/Datasets/Air pollution/november_2018_sensor_data_archive.csv'
            ];

            let allData = [];

            for (const file of dataFiles) {
                try {
                    const response = await fetch(file);
                    if (response.ok) {
                        const csvText = await response.text();
                        const data = this.parseCSV(csvText);
                        allData = allData.concat(data);
                        console.log(`Loaded ${data.length} records from ${file}`);
                    }
                } catch (error) {
                    console.warn(`Could not load ${file}:`, error);
                }
            }

            if (allData.length === 0) {
                // Fallback: Use sample data if files can't be loaded
                allData = this.getSampleData();
                console.log('Using sample air quality data');
            }

            this.currentData = this.processAirQualityData(allData);
            console.log(`Processed ${this.currentData.length} unique sensor locations`);
            
            return this.currentData;
        } catch (error) {
            console.error('Error loading air quality data:', error);
            return this.getSampleData();
        }
    }

    // Sample data for testing when CSV files are not accessible
    getSampleData() {
        return [
            {
                sensor_id: '49',
                lat: -1.289,
                lon: 36.825,
                location: '3573',
                measurements: {
                    P2: { value: 45.2, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    P1: { value: 52.1, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    temperature: { value: 24.5, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' },
                    humidity: { value: 68.2, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' }
                }
            },
            {
                sensor_id: '122',
                lat: -0.108,
                lon: 34.749,
                location: '56',
                measurements: {
                    P2: { value: 28.7, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'SDS011' },
                    P1: { value: 34.2, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'SDS011' },
                    temperature: { value: 26.8, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' },
                    humidity: { value: 72.5, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' }
                }
            },
            {
                sensor_id: '4898',
                lat: -1.311,
                lon: 36.817,
                location: '3966',
                measurements: {
                    P2: { value: 62.8, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    P1: { value: 71.3, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    temperature: { value: 23.1, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' },
                    humidity: { value: 65.8, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' }
                }
            },
            {
                sensor_id: '201',
                lat: -4.043,
                lon: 39.668,
                location: 'Mombasa',
                measurements: {
                    P2: { value: 38.9, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'SDS011' },
                    P1: { value: 44.7, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'SDS011' },
                    temperature: { value: 28.5, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' },
                    humidity: { value: 78.2, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' }
                }
            },
            {
                sensor_id: '302',
                lat: -0.091,
                lon: 34.768,
                location: 'Kisumu',
                measurements: {
                    P2: { value: 31.5, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    P1: { value: 37.2, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'pms5003' },
                    temperature: { value: 25.7, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' },
                    humidity: { value: 74.1, timestamp: '2025-08-12T10:00:00Z', sensor_type: 'DHT22' }
                }
            }
        ];
    }

    // Get aggregated statistics
    getAirQualityStats() {
        if (!this.currentData) return null;

        const stats = {
            total_sensors: this.currentData.length,
            avg_pm25: 0,
            avg_pm10: 0,
            avg_temperature: 0,
            avg_humidity: 0,
            good_quality_sensors: 0,
            moderate_quality_sensors: 0,
            poor_quality_sensors: 0
        };

        let pm25Sum = 0, pm10Sum = 0, tempSum = 0, humiditySum = 0;
        let pm25Count = 0, pm10Count = 0, tempCount = 0, humidityCount = 0;

        this.currentData.forEach(location => {
            if (location.measurements.P2) {
                pm25Sum += location.measurements.P2.value;
                pm25Count++;
                
                const aqi = this.calculateAQI(location.measurements.P2.value);
                if (aqi.aqi <= 50) stats.good_quality_sensors++;
                else if (aqi.aqi <= 100) stats.moderate_quality_sensors++;
                else stats.poor_quality_sensors++;
            }
            
            if (location.measurements.P1) {
                pm10Sum += location.measurements.P1.value;
                pm10Count++;
            }
            
            if (location.measurements.temperature) {
                tempSum += location.measurements.temperature.value;
                tempCount++;
            }
            
            if (location.measurements.humidity) {
                humiditySum += location.measurements.humidity.value;
                humidityCount++;
            }
        });

        stats.avg_pm25 = pm25Count > 0 ? (pm25Sum / pm25Count).toFixed(1) : 0;
        stats.avg_pm10 = pm10Count > 0 ? (pm10Sum / pm10Count).toFixed(1) : 0;
        stats.avg_temperature = tempCount > 0 ? (tempSum / tempCount).toFixed(1) : 0;
        stats.avg_humidity = humidityCount > 0 ? (humiditySum / humidityCount).toFixed(1) : 0;

        return stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirQualityProcessor;
} else if (typeof window !== 'undefined') {
    window.AirQualityProcessor = AirQualityProcessor;
}
