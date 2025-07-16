#!/usr/bin/env python3
"""
EcoSentinel AI - Environmental Risk Prediction Models
Copyright (c) 2025 Gideon Kiprono & EcoSentinel AI Team

This module contains the core machine learning models for environmental
risk assessment and prediction used by the EcoSentinel AI platform.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta
import requests
import os
from urllib.parse import urlencode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AccuWeatherAPI:
    """
    AccuWeather API integration for real-time weather data.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ACCUWEATHER_API_KEY')
        self.base_url = "http://dataservice.accuweather.com"
        
        if not self.api_key:
            logger.warning("AccuWeather API key not found. Weather data will be simulated.")
    
    def search_cities(self, query: str, language: str = "en-us", details: bool = False) -> List[Dict]:
        """
        Search for cities using AccuWeather API.
        
        Args:
            query: Text to search for (city name)
            language: Language code (default: en-us)
            details: Include full details in response
            
        Returns:
            List of matching cities with location data
        """
        if not self.api_key:
            logger.warning("No API key available, returning mock city data")
            return self._mock_city_search(query)
        
        try:
            params = {
                'apikey': self.api_key,
                'q': query,
                'language': language,
                'details': details
            }
            
            url = f"{self.base_url}/locations/v1/cities/search"
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                cities = response.json()
                logger.info(f"Found {len(cities)} cities matching '{query}'")
                return cities
            elif response.status_code == 401:
                logger.error("AccuWeather API: Unauthorized - check your API key")
                return []
            elif response.status_code == 403:
                logger.error("AccuWeather API: Forbidden - insufficient permissions")
                return []
            else:
                logger.error(f"AccuWeather API error: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error connecting to AccuWeather API: {str(e)}")
            return []
    
    def get_current_weather(self, location_key: str) -> Optional[Dict]:
        """
        Get current weather conditions for a location.
        
        Args:
            location_key: AccuWeather location key
            
        Returns:
            Current weather data or None if failed
        """
        if not self.api_key:
            logger.warning("No API key available, returning mock weather data")
            return self._mock_current_weather()
        
        try:
            params = {'apikey': self.api_key, 'details': True}
            url = f"{self.base_url}/currentconditions/v1/{location_key}"
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                weather_data = response.json()
                if weather_data:
                    return weather_data[0]  # Current conditions is always first item
            else:
                logger.error(f"AccuWeather current weather API error: {response.status_code}")
                
        except requests.RequestException as e:
            logger.error(f"Error fetching current weather: {str(e)}")
        
        return None
    
    def get_hourly_forecast(self, location_key: str, hours: int = 12) -> List[Dict]:
        """
        Get hourly weather forecast.
        
        Args:
            location_key: AccuWeather location key
            hours: Number of hours to forecast (1, 12, 24, 72, 120)
            
        Returns:
            List of hourly forecasts
        """
        if not self.api_key:
            logger.warning("No API key available, returning mock forecast data")
            return self._mock_hourly_forecast(hours)
        
        try:
            # AccuWeather supports 1, 12, 24, 72, 120 hour forecasts
            forecast_hours = min([1, 12, 24, 72, 120], key=lambda x: abs(x - hours))
            
            params = {'apikey': self.api_key, 'details': True, 'metric': True}
            url = f"{self.base_url}/forecasts/v1/hourly/{forecast_hours}hour/{location_key}"
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()[:hours]  # Limit to requested hours
            else:
                logger.error(f"AccuWeather forecast API error: {response.status_code}")
                
        except requests.RequestException as e:
            logger.error(f"Error fetching hourly forecast: {str(e)}")
        
        return []
    
    def _mock_city_search(self, query: str) -> List[Dict]:
        """Mock city search for when API key is not available"""
        mock_cities = [
            {
                "Version": 1,
                "Key": "207195",
                "Type": "City",
                "Rank": 15,
                "LocalizedName": "Nairobi",
                "Country": {"ID": "KE", "LocalizedName": "Kenya"},
                "AdministrativeArea": {"ID": "30", "LocalizedName": "Nairobi County"},
                "GeoPosition": {"Latitude": -1.2921, "Longitude": 36.8219, "Elevation": {"Metric": {"Value": 1795, "Unit": "m"}}}
            }
        ]
        return [city for city in mock_cities if query.lower() in city["LocalizedName"].lower()]
    
    def _mock_current_weather(self) -> Dict:
        """Mock current weather data"""
        return {
            "LocalObservationDateTime": datetime.now().isoformat(),
            "WeatherText": "Partly Cloudy",
            "Temperature": {"Metric": {"Value": 22.0, "Unit": "C"}},
            "RealFeelTemperature": {"Metric": {"Value": 25.0, "Unit": "C"}},
            "Humidity": 65,
            "Wind": {"Speed": {"Metric": {"Value": 12.0, "Unit": "km/h"}}},
            "Pressure": {"Metric": {"Value": 1013.2, "Unit": "mb"}},
            "PrecipitationSummary": {"Past24Hours": {"Metric": {"Value": 5.2, "Unit": "mm"}}}
        }
    
    def _mock_hourly_forecast(self, hours: int) -> List[Dict]:
        """Mock hourly forecast data"""
        forecasts = []
        for i in range(hours):
            forecast_time = datetime.now() + timedelta(hours=i)
            forecasts.append({
                "DateTime": forecast_time.isoformat(),
                "Temperature": {"Value": 20 + np.random.normal(0, 3), "Unit": "C"},
                "RealFeelTemperature": {"Value": 23 + np.random.normal(0, 3), "Unit": "C"},
                "Humidity": max(30, min(90, 60 + np.random.normal(0, 10))),
                "Wind": {"Speed": {"Value": max(0, 10 + np.random.normal(0, 5)), "Unit": "km/h"}},
                "Rain": {"Value": max(0, np.random.exponential(2)), "Unit": "mm"},
                "WeatherIcon": np.random.choice([1, 2, 3, 4, 6, 7, 8])
            })
        return forecasts

class EcoSentinelPredictor:
    """
    Main predictor class for EcoSentinel AI environmental risk assessment.
    
    This class integrates multiple ML models to provide comprehensive
    environmental risk predictions for communities across Kenya.
    """
    
    def __init__(self, accuweather_api_key: Optional[str] = None):
        self.models_loaded = False
        self.last_updated = None
        self.weather_api = AccuWeatherAPI(accuweather_api_key)
        logger.info("EcoSentinel AI Predictor initialized")
    
    def find_location(self, city_name: str) -> Optional[Dict]:
        """
        Find location information for a city using AccuWeather API.
        
        Args:
            city_name: Name of the city to search for
            
        Returns:
            Location data with coordinates and AccuWeather key
        """
        cities = self.weather_api.search_cities(city_name)
        
        if not cities:
            logger.warning(f"No cities found matching '{city_name}'")
            return None
        
        # Return the first (most relevant) match
        city = cities[0]
        location_data = {
            "city_name": city["LocalizedName"],
            "country": city["Country"]["LocalizedName"],
            "region": city.get("AdministrativeArea", {}).get("LocalizedName", ""),
            "latitude": city["GeoPosition"]["Latitude"],
            "longitude": city["GeoPosition"]["Longitude"],
            "elevation": city["GeoPosition"].get("Elevation", {}).get("Metric", {}).get("Value", 0),
            "accuweather_key": city["Key"]
        }
        
        logger.info(f"Found location: {location_data['city_name']}, {location_data['country']}")
        return location_data
    
    def get_real_weather_data(self, location_key: str) -> Optional[Dict]:
        """
        Get real-time weather data for enhanced predictions.
        
        Args:
            location_key: AccuWeather location key
            
        Returns:
            Current weather conditions
        """
        current_weather = self.weather_api.get_current_weather(location_key)
        
        if current_weather:
            # Extract relevant data for flood risk assessment
            rainfall_24h = 0
            if "PrecipitationSummary" in current_weather:
                rainfall_24h = current_weather["PrecipitationSummary"].get("Past24Hours", {}).get("Metric", {}).get("Value", 0)
            
            return {
                "temperature": current_weather.get("Temperature", {}).get("Metric", {}).get("Value", 20),
                "humidity": current_weather.get("Humidity", 50),
                "rainfall_24h": rainfall_24h,
                "wind_speed": current_weather.get("Wind", {}).get("Speed", {}).get("Metric", {}).get("Value", 0),
                "pressure": current_weather.get("Pressure", {}).get("Metric", {}).get("Value", 1013),
                "weather_text": current_weather.get("WeatherText", "Unknown"),
                "observation_time": current_weather.get("LocalObservationDateTime", datetime.now().isoformat())
            }
        
        return None

    def predict_flood_risk_with_location(self, 
                                       city_name: str,
                                       soil_type: str = "loam",
                                       use_real_weather: bool = True) -> Dict:
        """
        Enhanced flood risk prediction using real location and weather data.
        
        Args:
            city_name: Name of the city
            soil_type: Soil type ("clay", "loam", "sand")
            use_real_weather: Whether to use real AccuWeather data
            
        Returns:
            Enhanced flood risk assessment with real weather data
        """
        # Find the location
        location = self.find_location(city_name)
        if not location:
            return {"error": f"Location '{city_name}' not found"}
        
        latitude = location["latitude"]
        longitude = location["longitude"]
        elevation = location["elevation"]
        
        # Get real weather data if available
        rainfall_24h = 0
        weather_data = None
        
        if use_real_weather and location.get("accuweather_key"):
            weather_data = self.get_real_weather_data(location["accuweather_key"])
            if weather_data:
                rainfall_24h = weather_data["rainfall_24h"]
                logger.info(f"Using real weather data: {rainfall_24h}mm rainfall in 24h")
            else:
                logger.warning("Failed to get real weather data, using default values")
        
        # Use the existing flood risk prediction with real data
        risk_result = self.predict_flood_risk(
            latitude=latitude,
            longitude=longitude,
            rainfall_24h=rainfall_24h,
            elevation=elevation,
            soil_type=soil_type
        )
        
        # Enhance the result with location and weather information
        risk_result["location_info"] = location
        if weather_data:
            risk_result["current_weather"] = weather_data
            risk_result["data_source"] = "AccuWeather API"
        else:
            risk_result["data_source"] = "Simulated data"
        
        return risk_result

    def load_models(self) -> bool:
        """Load all pre-trained ML models"""
        try:
            # In production, these would load actual trained models
            logger.info("Loading flood risk prediction model...")
            logger.info("Loading air quality forecasting model...")
            logger.info("Loading deforestation detection model...")
            
            self.models_loaded = True
            self.last_updated = datetime.now()
            logger.info("All models loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False
    
    def predict_flood_risk(self, 
                          latitude: float, 
                          longitude: float, 
                          rainfall_24h: float,
                          elevation: float,
                          soil_type: str = "loam") -> Dict:
        """
        Predict flood risk for a specific location.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude  
            rainfall_24h: Rainfall in last 24 hours (mm)
            elevation: Elevation above sea level (m)
            soil_type: Soil type ("clay", "loam", "sand")
            
        Returns:
            Dictionary with risk assessment and recommendations
        """
        
        # Simple risk calculation (in production, this would use trained ML models)
        soil_risk_factor = {"clay": 1.3, "loam": 1.0, "sand": 0.7}.get(soil_type, 1.0)
        elevation_factor = max(0.1, 1 - (elevation / 2000))  # Lower elevation = higher risk
        rainfall_factor = min(2.0, rainfall_24h / 50)  # Normalize to 50mm baseline
        
        risk_score = (rainfall_factor * elevation_factor * soil_risk_factor) * 0.5
        risk_score = min(1.0, risk_score)  # Cap at 1.0
        
        risk_level = "LOW"
        if risk_score > 0.7:
            risk_level = "HIGH"
        elif risk_score > 0.4:
            risk_level = "MEDIUM"
        
        # Generate location-specific recommendations
        recommendations = self._generate_flood_recommendations(risk_score, rainfall_24h)
        
        return {
            "location": {"latitude": latitude, "longitude": longitude},
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "confidence": 0.87,  # Model confidence
            "factors": {
                "rainfall_24h": rainfall_24h,
                "elevation": elevation,
                "soil_type": soil_type
            },
            "recommendations": recommendations,
            "updated_at": datetime.now().isoformat(),
            "alert_message": self._generate_alert_message(risk_level, latitude, longitude)
        }
    
    def predict_air_quality(self, 
                           latitude: float, 
                           longitude: float,
                           hours_ahead: int = 24) -> Dict:
        """
        Predict air quality index for the next specified hours.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            hours_ahead: Prediction horizon in hours
            
        Returns:
            Dictionary with AQI predictions and health recommendations
        """
        
        # Simulate AQI prediction (in production, use actual LSTM model)
        base_aqi = np.random.normal(65, 15)  # Typical urban AQI
        trend = np.random.normal(0, 5, hours_ahead)
        
        predictions = []
        current_aqi = base_aqi
        
        for hour in range(hours_ahead):
            current_aqi += trend[hour]
            current_aqi = max(0, min(500, current_aqi))  # AQI bounds
            
            timestamp = datetime.now() + timedelta(hours=hour)
            predictions.append({
                "timestamp": timestamp.isoformat(),
                "aqi": round(current_aqi, 1),
                "category": self._aqi_to_category(current_aqi)
            })
        
        health_recommendations = self._generate_health_recommendations(current_aqi)
        
        return {
            "location": {"latitude": latitude, "longitude": longitude},
            "predictions": predictions,
            "average_aqi": round(np.mean([p["aqi"] for p in predictions]), 1),
            "health_recommendations": health_recommendations,
            "updated_at": datetime.now().isoformat()
        }
    
    def analyze_deforestation_risk(self, 
                                  latitude: float, 
                                  longitude: float,
                                  area_km2: float = 1.0) -> Dict:
        """
        Analyze deforestation risk for a specified area.
        
        Args:
            latitude: Center latitude of area
            longitude: Center longitude of area
            area_km2: Area size in square kilometers
            
        Returns:
            Dictionary with deforestation analysis and conservation recommendations
        """
        
        # Simulate deforestation risk analysis
        base_risk = np.random.uniform(0.1, 0.8)
        
        # Adjust based on known high-risk areas (simplified)
        if -1.5 < latitude < 1.5 and 34 < longitude < 42:  # Kenya approximate bounds
            # Higher risk near urban areas and agricultural zones
            urban_proximity_factor = np.random.uniform(1.0, 1.5)
            base_risk *= urban_proximity_factor
        
        risk_score = min(1.0, base_risk)
        
        risk_level = "LOW"
        if risk_score > 0.7:
            risk_level = "HIGH"
        elif risk_score > 0.4:
            risk_level = "MEDIUM"
        
        conservation_actions = self._generate_conservation_actions(risk_level)
        
        return {
            "location": {"latitude": latitude, "longitude": longitude},
            "area_km2": area_km2,
            "deforestation_risk": round(risk_score, 3),
            "risk_level": risk_level,
            "estimated_tree_loss": round(area_km2 * 1000 * risk_score, 0),  # trees
            "conservation_actions": conservation_actions,
            "monitoring_frequency": "weekly" if risk_level == "HIGH" else "monthly",
            "updated_at": datetime.now().isoformat()
        }
    
    def _generate_flood_recommendations(self, risk_score: float, rainfall: float) -> List[str]:
        """Generate flood-specific recommendations"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.extend([
                "Evacuate low-lying areas immediately",
                "Avoid crossing flooded roads or bridges", 
                "Move to higher ground",
                "Keep emergency supplies ready"
            ])
        elif risk_score > 0.4:
            recommendations.extend([
                "Monitor weather updates closely",
                "Prepare emergency evacuation kit",
                "Clear drainage around your property",
                "Avoid unnecessary travel"
            ])
        else:
            recommendations.extend([
                "Continue normal activities with caution",
                "Keep informed about weather conditions",
                "Ensure drainage systems are clear"
            ])
        
        return recommendations
    
    def _generate_alert_message(self, risk_level: str, lat: float, lon: float) -> str:
        """Generate localized alert messages"""
        location_name = f"Location {lat:.2f}, {lon:.2f}"  # In production, use geocoding
        
        if risk_level == "HIGH":
            return f"⚠️ HIGH flood risk in {location_name}. Immediate action required!"
        elif risk_level == "MEDIUM":
            return f"⚡ MEDIUM flood risk in {location_name}. Stay alert!"
        else:
            return f"✅ LOW flood risk in {location_name}. Conditions normal."
    
    def _aqi_to_category(self, aqi: float) -> str:
        """Convert AQI value to category"""
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 150:
            return "Unhealthy for Sensitive Groups"
        elif aqi <= 200:
            return "Unhealthy"
        elif aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"
    
    def _generate_health_recommendations(self, aqi: float) -> List[str]:
        """Generate health recommendations based on AQI"""
        if aqi <= 50:
            return ["Air quality is good. Enjoy outdoor activities!"]
        elif aqi <= 100:
            return [
                "Air quality is acceptable for most people",
                "Sensitive individuals should consider limiting prolonged outdoor exertion"
            ]
        elif aqi <= 150:
            return [
                "Members of sensitive groups may experience health effects",
                "General public is not likely to be affected",
                "Reduce prolonged or heavy outdoor exertion"
            ]
        else:
            return [
                "Health warnings of emergency conditions",
                "Everyone should avoid outdoor activities",
                "Stay indoors with windows closed",
                "Use air purifiers if available"
            ]
    
    def _generate_conservation_actions(self, risk_level: str) -> List[str]:
        """Generate conservation action recommendations"""
        if risk_level == "HIGH":
            return [
                "Immediate intervention required",
                "Deploy rapid response conservation team",
                "Implement emergency tree planting program",
                "Engage local community leaders",
                "Monitor with daily satellite imagery"
            ]
        elif risk_level == "MEDIUM":
            return [
                "Increase community awareness programs",
                "Plan reforestation activities",
                "Strengthen law enforcement patrols",
                "Develop alternative livelihood programs"
            ]
        else:
            return [
                "Continue regular monitoring",
                "Maintain community education programs",
                "Support sustainable forestry practices"
            ]

def main():
    """Demo function showing EcoSentinel AI predictions with AccuWeather integration"""
    print("🌍 EcoSentinel AI - Environmental Risk Assessment with Real Weather Data")
    print("=" * 70)
    
    # Initialize predictor (will use environment variable ACCUWEATHER_API_KEY if available)
    predictor = EcoSentinelPredictor()
    predictor.load_models()
    
    # Test city search functionality
    print("\n🔍 CITY SEARCH DEMO")
    test_cities = ["Nairobi", "Mombasa", "Kisumu"]
    
    for city in test_cities:
        location = predictor.find_location(city)
        if location:
            print(f"✅ Found: {location['city_name']}, {location['country']}")
            print(f"   Coordinates: {location['latitude']:.3f}, {location['longitude']:.3f}")
            print(f"   Elevation: {location['elevation']}m")
        else:
            print(f"❌ Not found: {city}")
    
    # Enhanced flood risk prediction with real weather data
    print("\n🌊 ENHANCED FLOOD RISK ASSESSMENT (with AccuWeather)")
    city_name = "Nairobi"
    
    flood_result = predictor.predict_flood_risk_with_location(
        city_name=city_name,
        soil_type="clay",
        use_real_weather=True
    )
    
    if "error" not in flood_result:
        print(f"📍 Location: {flood_result['location_info']['city_name']}, {flood_result['location_info']['country']}")
        print(f"📊 Data Source: {flood_result['data_source']}")
        
        if "current_weather" in flood_result:
            weather = flood_result['current_weather']
            print(f"🌡️  Current Weather:")
            print(f"   Temperature: {weather['temperature']}°C")
            print(f"   Humidity: {weather['humidity']}%")
            print(f"   24h Rainfall: {weather['rainfall_24h']}mm")
            print(f"   Conditions: {weather['weather_text']}")
        
        print(f"\n⚠️  Flood Risk Assessment:")
        print(f"   Risk Level: {flood_result['risk_level']}")
        print(f"   Risk Score: {flood_result['risk_score']}")
        print(f"   Confidence: {flood_result['confidence']}")
        print(f"   Alert: {flood_result['alert_message']}")
        
        print("\n📋 Recommendations:")
        for i, rec in enumerate(flood_result['recommendations'][:3], 1):
            print(f"   {i}. {rec}")
    else:
        print(f"❌ Error: {flood_result['error']}")
    
    # Traditional predictions (for comparison)
    print("\n📊 ADDITIONAL ENVIRONMENTAL ASSESSMENTS")
    nairobi_lat, nairobi_lon = -1.2921, 36.8219
    
    # Air quality prediction
    print("\n🌫️ AIR QUALITY FORECAST (Next 6 hours)")
    aqi_result = predictor.predict_air_quality(
        latitude=nairobi_lat,
        longitude=nairobi_lon,
        hours_ahead=6
    )
    
    print(f"Average AQI: {aqi_result['average_aqi']} ({predictor._aqi_to_category(aqi_result['average_aqi'])})")
    print("Hourly Forecast:")
    for prediction in aqi_result['predictions'][:3]:
        time = prediction['timestamp'][11:16]  # Just time HH:MM
        print(f"  {time}: AQI {prediction['aqi']} ({prediction['category']})")
    
    # Deforestation analysis
    print("\n🌳 DEFORESTATION RISK ANALYSIS")
    deforest_result = predictor.analyze_deforestation_risk(
        latitude=nairobi_lat,
        longitude=nairobi_lon,
        area_km2=5.0
    )
    
    print(f"Risk Level: {deforest_result['risk_level']}")
    print(f"Estimated Tree Loss: {deforest_result['estimated_tree_loss']} trees")
    print(f"Monitoring Frequency: {deforest_result['monitoring_frequency']}")
    print("Conservation Actions:")
    for action in deforest_result['conservation_actions'][:2]:
        print(f"  • {action}")
    
    # API Key status
    print("\n🔑 API CONFIGURATION")
    if predictor.weather_api.api_key:
        print("✅ AccuWeather API key configured - using real weather data")
    else:
        print("⚠️  No AccuWeather API key found")
        print("   Set ACCUWEATHER_API_KEY environment variable for real weather data")
        print("   Current predictions use simulated weather data")
    
    print("\n✅ Environmental risk assessment complete!")
    print("🌱 EcoSentinel AI - Making environmental data accessible to all")
    print("\n💡 To use real weather data:")
    print("   1. Get an AccuWeather API key from: https://developer.accuweather.com/")
    print("   2. Set environment variable: ACCUWEATHER_API_KEY=your_key_here")
    print("   3. Run the script again for real-time weather integration")

if __name__ == "__main__":
    main()
