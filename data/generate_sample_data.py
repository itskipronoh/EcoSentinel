#!/usr/bin/env python3
"""
EcoSentinel AI - Sample Environmental Data Generator
Copyright (c) 2025 Gideon Kiprono & EcoSentinel AI Team

This script generates sample environmental datasets for analysis and model training.
The data represents realistic patterns for various Kenyan regions.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

# Set random seed for reproducible data
np.random.seed(42)

# Kenyan regions with coordinates
KENYAN_REGIONS = {
    'Nairobi': {'lat': -1.2921, 'lon': 36.8219, 'elevation': 1795, 'population': 4397073},
    'Kisumu': {'lat': -0.0917, 'lon': 34.7680, 'elevation': 1131, 'population': 610082},
    'Eldoret': {'lat': 0.5143, 'lon': 35.2698, 'elevation': 2085, 'population': 475716},
    'Mandera': {'lat': 3.9366, 'lon': 41.8670, 'elevation': 231, 'population': 867457},
    'Mombasa': {'lat': -4.0435, 'lon': 39.6682, 'elevation': 17, 'population': 1208333},
    'Nakuru': {'lat': -0.3031, 'lon': 36.0800, 'elevation': 1850, 'population': 570674},
    'Turkana': {'lat': 3.1167, 'lon': 35.5833, 'elevation': 365, 'population': 926976},
    'Kitui': {'lat': -1.3669, 'lon': 38.0109, 'elevation': 1136, 'population': 1136187},
    'Nyeri': {'lat': -0.4167, 'lon': 36.9500, 'elevation': 1759, 'population': 759164},
    'Machakos': {'lat': -1.5219, 'lon': 37.2634, 'elevation': 1549, 'population': 1421932}
}

def generate_weather_data(start_date='2020-01-01', end_date='2024-12-31'):
    """Generate historical weather data for Kenyan regions"""
    
    print("📊 Generating weather data...")
    
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    weather_data = []
    
    for region, coords in KENYAN_REGIONS.items():
        print(f"   Processing {region}...")
        
        for date in date_range:
            # Simulate seasonal patterns
            day_of_year = date.timetuple().tm_yday
            
            # Temperature patterns (based on elevation and geography)
            base_temp = 25 - (coords['elevation'] / 300)  # Temperature decreases with elevation
            seasonal_temp = 3 * np.sin(2 * np.pi * day_of_year / 365 - np.pi/4)  # Seasonal variation
            daily_temp = base_temp + seasonal_temp + np.random.normal(0, 2)
            
            # Rainfall patterns (wet and dry seasons)
            if region in ['Mandera', 'Turkana']:  # Arid regions
                base_rainfall = 0.5
            elif region in ['Mombasa']:  # Coastal
                base_rainfall = 3.0
            else:  # Highland regions
                base_rainfall = 2.0
                
            # Wet seasons: Mar-May, Oct-Dec
            if (date.month in [3, 4, 5]) or (date.month in [10, 11, 12]):
                rainfall = base_rainfall * (2 + np.random.exponential(1))
            else:
                rainfall = base_rainfall * np.random.exponential(0.3)
            
            # Humidity based on coastal proximity
            if region == 'Mombasa':
                humidity = 70 + 15 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 5)
            elif region in ['Mandera', 'Turkana']:
                humidity = 30 + 10 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 3)
            else:
                humidity = 50 + 20 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 5)
            
            humidity = max(10, min(95, humidity))  # Clamp between 10-95%
            
            # Wind speed
            wind_speed = 5 + 3 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 2)
            wind_speed = max(0, wind_speed)
            
            weather_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'region': region,
                'latitude': coords['lat'],
                'longitude': coords['lon'],
                'elevation': coords['elevation'],
                'temperature_c': round(daily_temp, 1),
                'rainfall_mm': round(max(0, rainfall), 2),
                'humidity_percent': round(humidity, 1),
                'wind_speed_kmh': round(wind_speed, 1),
                'pressure_hpa': round(1013 + np.random.normal(0, 10), 1)
            })
    
    return pd.DataFrame(weather_data)

def generate_air_quality_data(start_date='2020-01-01', end_date='2024-12-31'):
    """Generate air quality measurements for Kenyan regions"""
    
    print("🌫️ Generating air quality data...")
    
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    aqi_data = []
    
    for region, coords in KENYAN_REGIONS.items():
        print(f"   Processing {region}...")
        
        # Base pollution levels by region type
        if region == 'Nairobi':  # Major city
            base_pm25 = 25
            base_pm10 = 40
        elif region == 'Mombasa':  # Coastal city
            base_pm25 = 20
            base_pm10 = 35
        elif region in ['Mandera', 'Turkana']:  # Arid regions (dust)
            base_pm25 = 30
            base_pm10 = 60
        else:  # Rural/smaller towns
            base_pm25 = 15
            base_pm10 = 25
        
        for date in date_range:
            day_of_year = date.timetuple().tm_yday
            
            # Seasonal variations (dry season = more dust)
            if date.month in [12, 1, 2, 6, 7, 8]:  # Dry months
                seasonal_factor = 1.3
            else:
                seasonal_factor = 0.8
            
            # PM2.5 levels
            pm25 = base_pm25 * seasonal_factor + np.random.normal(0, 5)
            pm25 = max(5, pm25)
            
            # PM10 levels
            pm10 = base_pm10 * seasonal_factor + np.random.normal(0, 8)
            pm10 = max(pm25, pm10)  # PM10 should be >= PM2.5
            
            # Calculate AQI (simplified US EPA formula)
            aqi_pm25 = calculate_aqi(pm25, 'pm25')
            aqi_pm10 = calculate_aqi(pm10, 'pm10')
            aqi = max(aqi_pm25, aqi_pm10)
            
            # Other pollutants
            no2 = max(5, 15 + np.random.normal(0, 5))  # NO2 in µg/m³
            so2 = max(1, 8 + np.random.normal(0, 3))   # SO2 in µg/m³
            o3 = max(20, 80 + np.random.normal(0, 15))  # O3 in µg/m³
            
            aqi_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'region': region,
                'latitude': coords['lat'],
                'longitude': coords['lon'],
                'pm25_ugm3': round(pm25, 1),
                'pm10_ugm3': round(pm10, 1),
                'no2_ugm3': round(no2, 1),
                'so2_ugm3': round(so2, 1),
                'o3_ugm3': round(o3, 1),
                'aqi': round(aqi, 0),
                'aqi_category': get_aqi_category(aqi)
            })
    
    return pd.DataFrame(aqi_data)

def calculate_aqi(concentration, pollutant):
    """Calculate AQI based on pollutant concentration"""
    if pollutant == 'pm25':
        breakpoints = [(0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
                      (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 500.4, 301, 500)]
    elif pollutant == 'pm10':
        breakpoints = [(0, 54, 0, 50), (55, 154, 51, 100), (155, 254, 101, 150),
                      (255, 354, 151, 200), (355, 424, 201, 300), (425, 604, 301, 500)]
    else:
        return 50  # Default moderate AQI
    
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= concentration <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (concentration - bp_lo) + aqi_lo
    
    return 500  # Hazardous

def get_aqi_category(aqi):
    """Get AQI category based on value"""
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

def generate_flood_risk_data():
    """Generate historical flood events and risk factors"""
    
    print("🌊 Generating flood risk data...")
    
    flood_events = []
    risk_factors = []
    
    # Historical flood events (based on Kenya's flood patterns)
    historical_floods = [
        {'date': '2020-04-15', 'region': 'Nairobi', 'severity': 'Moderate', 'affected_area_km2': 25},
        {'date': '2020-05-20', 'region': 'Kisumu', 'severity': 'Severe', 'affected_area_km2': 45},
        {'date': '2021-03-10', 'region': 'Mombasa', 'severity': 'Moderate', 'affected_area_km2': 15},
        {'date': '2021-11-08', 'region': 'Turkana', 'severity': 'Severe', 'affected_area_km2': 120},
        {'date': '2022-04-22', 'region': 'Eldoret', 'severity': 'Minor', 'affected_area_km2': 8},
        {'date': '2022-10-12', 'region': 'Nakuru', 'severity': 'Moderate', 'affected_area_km2': 18},
        {'date': '2023-03-18', 'region': 'Kitui', 'severity': 'Severe', 'affected_area_km2': 35},
        {'date': '2023-11-25', 'region': 'Machakos', 'severity': 'Minor', 'affected_area_km2': 12},
        {'date': '2024-04-05', 'region': 'Nyeri', 'severity': 'Moderate', 'affected_area_km2': 22}
    ]
    
    for event in historical_floods:
        region_data = KENYAN_REGIONS[event['region']]
        flood_events.append({
            'date': event['date'],
            'region': event['region'],
            'latitude': region_data['lat'],
            'longitude': region_data['lon'],
            'severity': event['severity'],
            'affected_area_km2': event['affected_area_km2'],
            'estimated_affected_population': min(region_data['population'], 
                                               int(event['affected_area_km2'] * 1000)),
            'duration_hours': np.random.randint(6, 72),
            'max_water_level_m': round(np.random.uniform(0.5, 3.0), 1),
            'economic_impact_usd': np.random.randint(100000, 5000000)
        })
    
    # Generate risk factors for each region
    for region, coords in KENYAN_REGIONS.items():
        # Calculate risk factors based on geography and climate
        elevation_risk = max(0, 1 - coords['elevation'] / 2000)  # Lower elevation = higher risk
        population_risk = min(1, coords['population'] / 1000000)  # Higher population = higher risk
        
        # Proximity to water bodies (simplified)
        if region in ['Mombasa', 'Kisumu']:  # Coastal/lake regions
            water_proximity_risk = 0.8
        elif region in ['Nairobi', 'Nakuru']:  # Cities with rivers
            water_proximity_risk = 0.6
        else:
            water_proximity_risk = 0.3
        
        # Drainage infrastructure (urban vs rural)
        if region in ['Nairobi', 'Mombasa', 'Kisumu']:
            drainage_score = 0.7  # Better infrastructure
        else:
            drainage_score = 0.4  # Limited infrastructure
        
        overall_risk = (elevation_risk + population_risk + water_proximity_risk + (1 - drainage_score)) / 4
        
        risk_factors.append({
            'region': region,
            'latitude': coords['lat'],
            'longitude': coords['lon'],
            'elevation': coords['elevation'],
            'population': coords['population'],
            'elevation_risk_factor': round(elevation_risk, 2),
            'population_risk_factor': round(population_risk, 2),
            'water_proximity_risk_factor': round(water_proximity_risk, 2),
            'drainage_infrastructure_score': round(drainage_score, 2),
            'overall_flood_risk_score': round(overall_risk, 2),
            'risk_category': 'High' if overall_risk > 0.7 else 'Medium' if overall_risk > 0.4 else 'Low'
        })
    
    return pd.DataFrame(flood_events), pd.DataFrame(risk_factors)

def generate_environmental_indicators():
    """Generate environmental health indicators"""
    
    print("🌱 Generating environmental indicators...")
    
    indicators = []
    
    for region, coords in KENYAN_REGIONS.items():
        # Forest cover (based on Kenya's geography)
        if region in ['Nyeri', 'Eldoret']:  # Highland regions
            forest_cover = np.random.uniform(15, 35)
        elif region in ['Nairobi', 'Nakuru']:  # Urban areas
            forest_cover = np.random.uniform(5, 15)
        elif region in ['Mandera', 'Turkana']:  # Arid regions
            forest_cover = np.random.uniform(1, 5)
        else:
            forest_cover = np.random.uniform(8, 20)
        
        # Water quality index (1-100, higher is better)
        if region in ['Nairobi', 'Mombasa']:  # Urban pollution
            water_quality = np.random.uniform(45, 65)
        elif region in ['Mandera', 'Turkana']:  # Water scarcity issues
            water_quality = np.random.uniform(35, 55)
        else:
            water_quality = np.random.uniform(60, 85)
        
        # Soil health index (1-100, higher is better)
        if region in ['Mandera', 'Turkana']:  # Arid degraded soils
            soil_health = np.random.uniform(25, 45)
        elif region in ['Nyeri', 'Kitui']:  # Agricultural regions
            soil_health = np.random.uniform(65, 85)
        else:
            soil_health = np.random.uniform(50, 70)
        
        # Biodiversity index (species richness proxy)
        if region in ['Mombasa', 'Turkana']:  # Unique ecosystems
            biodiversity_index = np.random.uniform(70, 90)
        elif region in ['Nairobi']:  # Urban areas
            biodiversity_index = np.random.uniform(30, 50)
        else:
            biodiversity_index = np.random.uniform(50, 75)
        
        indicators.append({
            'region': region,
            'latitude': coords['lat'],
            'longitude': coords['lon'],
            'forest_cover_percent': round(forest_cover, 1),
            'water_quality_index': round(water_quality, 1),
            'soil_health_index': round(soil_health, 1),
            'biodiversity_index': round(biodiversity_index, 1),
            'air_quality_annual_avg': round(np.random.uniform(15, 45), 1),
            'waste_management_score': round(np.random.uniform(30, 80), 1),
            'renewable_energy_percent': round(np.random.uniform(10, 60), 1),
            'last_updated': '2024-12-01'
        })
    
    return pd.DataFrame(indicators)

def main():
    """Generate all sample datasets"""
    
    print("🌍 EcoSentinel AI - Sample Data Generation")
    print("=" * 50)
    
    # Create data directory if it doesn't exist
    os.makedirs('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets', exist_ok=True)
    
    # Generate datasets
    weather_df = generate_weather_data()
    air_quality_df = generate_air_quality_data()
    flood_events_df, flood_risk_df = generate_flood_risk_data()
    env_indicators_df = generate_environmental_indicators()
    
    # Save datasets
    print("\n💾 Saving datasets...")
    
    weather_df.to_csv('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/weather_data.csv', index=False)
    print("   ✅ Weather data saved")
    
    air_quality_df.to_csv('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/air_quality_data.csv', index=False)
    print("   ✅ Air quality data saved")
    
    flood_events_df.to_csv('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/flood_events.csv', index=False)
    print("   ✅ Flood events data saved")
    
    flood_risk_df.to_csv('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/flood_risk_factors.csv', index=False)
    print("   ✅ Flood risk factors saved")
    
    env_indicators_df.to_csv('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/environmental_indicators.csv', index=False)
    print("   ✅ Environmental indicators saved")
    
    # Generate metadata
    metadata = {
        "dataset_info": {
            "title": "EcoSentinel AI Environmental Datasets",
            "description": "Sample environmental data for Kenya regions covering weather, air quality, flood risks, and environmental indicators",
            "version": "1.0.0",
            "created": datetime.now().isoformat(),
            "regions_covered": list(KENYAN_REGIONS.keys()),
            "temporal_coverage": "2020-01-01 to 2024-12-31",
            "spatial_coverage": "Kenya",
            "license": "MIT"
        },
        "datasets": {
            "weather_data.csv": {
                "description": "Daily weather measurements for Kenyan regions",
                "rows": len(weather_df),
                "columns": list(weather_df.columns),
                "temporal_resolution": "Daily",
                "spatial_resolution": "Regional"
            },
            "air_quality_data.csv": {
                "description": "Daily air quality measurements and AQI calculations",
                "rows": len(air_quality_df),
                "columns": list(air_quality_df.columns),
                "temporal_resolution": "Daily",
                "spatial_resolution": "Regional"
            },
            "flood_events.csv": {
                "description": "Historical flood events with impact assessment",
                "rows": len(flood_events_df),
                "columns": list(flood_events_df.columns),
                "temporal_resolution": "Event-based",
                "spatial_resolution": "Regional"
            },
            "flood_risk_factors.csv": {
                "description": "Regional flood risk assessment factors",
                "rows": len(flood_risk_df),
                "columns": list(flood_risk_df.columns),
                "temporal_resolution": "Static",
                "spatial_resolution": "Regional"
            },
            "environmental_indicators.csv": {
                "description": "Environmental health indicators by region",
                "rows": len(env_indicators_df),
                "columns": list(env_indicators_df.columns),
                "temporal_resolution": "Annual",
                "spatial_resolution": "Regional"
            }
        }
    }
    
    with open('/home/runner/work/EcoSentinel/EcoSentinel/data/datasets/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("   ✅ Metadata saved")
    print("\n🎯 Dataset generation complete!")
    print(f"\n📊 Summary:")
    print(f"   • Weather data: {len(weather_df):,} records")
    print(f"   • Air quality data: {len(air_quality_df):,} records")
    print(f"   • Flood events: {len(flood_events_df):,} records")
    print(f"   • Flood risk factors: {len(flood_risk_df):,} records")
    print(f"   • Environmental indicators: {len(env_indicators_df):,} records")
    print(f"\n🌍 Data covers {len(KENYAN_REGIONS)} regions across Kenya")
    print("📁 All files saved to: data/datasets/")

if __name__ == "__main__":
    main()