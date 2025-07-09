#!/usr/bin/env python3
"""
EcoSentinel AI - Environmental Risk Prediction Models
Copyright (c) 2025 Gideon Kiprono

This module contains the core machine learning models for environmental
risk assessment and prediction used by the EcoSentinel AI platform.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EcoSentinelPredictor:
    """
    Main predictor class for EcoSentinel AI environmental risk assessment.
    
    This class integrates multiple ML models to provide comprehensive
    environmental risk predictions for communities across Kenya.
    """
    
    def __init__(self):
        self.models_loaded = False
        self.last_updated = None
        logger.info("EcoSentinel AI Predictor initialized")
    
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
    """Demo function showing EcoSentinel AI predictions"""
    print("🌍 EcoSentinel AI - Environmental Risk Assessment")
    print("=" * 50)
    
    predictor = EcoSentinelPredictor()
    predictor.load_models()
    
    # Example predictions for Nairobi area
    nairobi_lat, nairobi_lon = -1.2921, 36.8219
    
    print(f"\n📍 Analyzing environmental risks for Nairobi area")
    print(f"Location: {nairobi_lat}, {nairobi_lon}")
    
    # Flood risk prediction
    print("\n🌊 FLOOD RISK ASSESSMENT")
    flood_result = predictor.predict_flood_risk(
        latitude=nairobi_lat,
        longitude=nairobi_lon,
        rainfall_24h=75.5,  # mm
        elevation=1795,     # meters
        soil_type="clay"
    )
    
    print(f"Risk Level: {flood_result['risk_level']}")
    print(f"Risk Score: {flood_result['risk_score']}")
    print(f"Alert: {flood_result['alert_message']}")
    print("Recommendations:")
    for rec in flood_result['recommendations'][:3]:
        print(f"  • {rec}")
    
    # Air quality prediction
    print("\n🌫️ AIR QUALITY FORECAST (Next 6 hours)")
    aqi_result = predictor.predict_air_quality(
        latitude=nairobi_lat,
        longitude=nairobi_lon,
        hours_ahead=6
    )
    
    print(f"Average AQI: {aqi_result['average_aqi']}")
    for prediction in aqi_result['predictions'][:3]:
        time = prediction['timestamp'][:16]  # Just date and hour
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
    print(f"Monitoring: {deforest_result['monitoring_frequency']}")
    
    print("\n✅ Environmental risk assessment complete!")
    print("\n🌱 EcoSentinel AI - Making environmental data accessible to all")

if __name__ == "__main__":
    main()
