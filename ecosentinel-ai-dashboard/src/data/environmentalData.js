// This file contains mock data for environmental metrics such as AQI and flood risk.

const environmentalData = {
    airQualityIndex: {
        location: "Nairobi, Kenya",
        value: 156,
        status: "Moderate",
        lastUpdated: "2023-10-01T12:00:00Z"
    },
    floodRisk: {
        location: "Nairobi, Kenya",
        level: "Medium",
        advice: "Monitor the situation closely.",
        lastUpdated: "2023-10-01T12:00:00Z"
    },
    heatIndex: {
        location: "Nairobi, Kenya",
        value: "28°C",
        status: "Normal",
        lastUpdated: "2023-10-01T12:00:00Z"
    },
    biodiversity: {
        location: "Nairobi, Kenya",
        forestCover: "92%",
        status: "Stable",
        lastUpdated: "2023-10-01T12:00:00Z"
    }
};

export default environmentalData;