#!/usr/bin/env python3
"""
EcoSentinel AI - Environmental Data Analysis Toolkit
Copyright (c) 2025 Gideon Kiprono & EcoSentinel AI Team

This module provides tools for analyzing environmental data and generating insights
for the EcoSentinel AI platform.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import os
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class EcoDataAnalyzer:
    """Environmental data analysis toolkit for EcoSentinel AI"""
    
    def __init__(self, data_dir: str = "/home/runner/work/EcoSentinel/EcoSentinel/data/datasets"):
        """Initialize the analyzer with data directory path"""
        self.data_dir = data_dir
        self.weather_data = None
        self.air_quality_data = None
        self.flood_events = None
        self.flood_risk_factors = None
        self.environmental_indicators = None
        
        # Load datasets if available
        self.load_datasets()
    
    def load_datasets(self):
        """Load all available datasets"""
        try:
            if os.path.exists(f"{self.data_dir}/weather_data.csv"):
                self.weather_data = pd.read_csv(f"{self.data_dir}/weather_data.csv")
                self.weather_data['date'] = pd.to_datetime(self.weather_data['date'])
                print("✅ Weather data loaded")
            
            if os.path.exists(f"{self.data_dir}/air_quality_data.csv"):
                self.air_quality_data = pd.read_csv(f"{self.data_dir}/air_quality_data.csv")
                self.air_quality_data['date'] = pd.to_datetime(self.air_quality_data['date'])
                print("✅ Air quality data loaded")
            
            if os.path.exists(f"{self.data_dir}/flood_events.csv"):
                self.flood_events = pd.read_csv(f"{self.data_dir}/flood_events.csv")
                self.flood_events['date'] = pd.to_datetime(self.flood_events['date'])
                print("✅ Flood events data loaded")
            
            if os.path.exists(f"{self.data_dir}/flood_risk_factors.csv"):
                self.flood_risk_factors = pd.read_csv(f"{self.data_dir}/flood_risk_factors.csv")
                print("✅ Flood risk factors loaded")
            
            if os.path.exists(f"{self.data_dir}/environmental_indicators.csv"):
                self.environmental_indicators = pd.read_csv(f"{self.data_dir}/environmental_indicators.csv")
                print("✅ Environmental indicators loaded")
                
        except Exception as e:
            print(f"❌ Error loading datasets: {e}")
    
    def get_region_summary(self, region: str) -> Dict:
        """Get comprehensive environmental summary for a region"""
        summary = {
            "region": region,
            "analysis_date": datetime.now().strftime("%Y-%m-%d"),
            "data_availability": {}
        }
        
        # Weather analysis
        if self.weather_data is not None:
            region_weather = self.weather_data[self.weather_data['region'] == region]
            if not region_weather.empty:
                recent_weather = region_weather.tail(30)  # Last 30 days
                summary["weather"] = {
                    "avg_temperature_c": round(recent_weather['temperature_c'].mean(), 1),
                    "total_rainfall_mm": round(recent_weather['rainfall_mm'].sum(), 1),
                    "avg_humidity_percent": round(recent_weather['humidity_percent'].mean(), 1),
                    "avg_wind_speed_kmh": round(recent_weather['wind_speed_kmh'].mean(), 1),
                    "data_records": len(region_weather)
                }
                summary["data_availability"]["weather"] = True
        
        # Air quality analysis
        if self.air_quality_data is not None:
            region_aqi = self.air_quality_data[self.air_quality_data['region'] == region]
            if not region_aqi.empty:
                recent_aqi = region_aqi.tail(30)  # Last 30 days
                summary["air_quality"] = {
                    "avg_aqi": round(recent_aqi['aqi'].mean(), 0),
                    "avg_pm25_ugm3": round(recent_aqi['pm25_ugm3'].mean(), 1),
                    "avg_pm10_ugm3": round(recent_aqi['pm10_ugm3'].mean(), 1),
                    "dominant_category": recent_aqi['aqi_category'].mode().iloc[0] if not recent_aqi.empty else "Unknown",
                    "data_records": len(region_aqi)
                }
                summary["data_availability"]["air_quality"] = True
        
        # Flood risk analysis
        if self.flood_events is not None:
            region_floods = self.flood_events[self.flood_events['region'] == region]
            summary["flood_history"] = {
                "total_events": len(region_floods),
                "last_event": region_floods['date'].max().strftime("%Y-%m-%d") if not region_floods.empty else "No events",
                "severe_events": len(region_floods[region_floods['severity'] == 'Severe'])
            }
            summary["data_availability"]["flood_events"] = True
        
        if self.flood_risk_factors is not None:
            region_risk = self.flood_risk_factors[self.flood_risk_factors['region'] == region]
            if not region_risk.empty:
                risk_data = region_risk.iloc[0]
                summary["flood_risk"] = {
                    "overall_risk_score": risk_data['overall_flood_risk_score'],
                    "risk_category": risk_data['risk_category'],
                    "elevation": risk_data['elevation'],
                    "drainage_score": risk_data['drainage_infrastructure_score']
                }
                summary["data_availability"]["flood_risk"] = True
        
        # Environmental indicators
        if self.environmental_indicators is not None:
            region_env = self.environmental_indicators[self.environmental_indicators['region'] == region]
            if not region_env.empty:
                env_data = region_env.iloc[0]
                summary["environmental_health"] = {
                    "forest_cover_percent": env_data['forest_cover_percent'],
                    "water_quality_index": env_data['water_quality_index'],
                    "soil_health_index": env_data['soil_health_index'],
                    "biodiversity_index": env_data['biodiversity_index'],
                    "waste_management_score": env_data['waste_management_score']
                }
                summary["data_availability"]["environmental_indicators"] = True
        
        return summary
    
    def analyze_climate_trends(self, region: str, start_date: str = None, end_date: str = None) -> Dict:
        """Analyze climate trends for a specific region"""
        if self.weather_data is None:
            return {"error": "Weather data not available"}
        
        region_data = self.weather_data[self.weather_data['region'] == region].copy()
        
        if start_date:
            region_data = region_data[region_data['date'] >= start_date]
        if end_date:
            region_data = region_data[region_data['date'] <= end_date]
        
        if region_data.empty:
            return {"error": f"No data available for {region}"}
        
        # Monthly aggregations
        region_data['year_month'] = region_data['date'].dt.to_period('M')
        monthly_stats = region_data.groupby('year_month').agg({
            'temperature_c': ['mean', 'min', 'max'],
            'rainfall_mm': 'sum',
            'humidity_percent': 'mean'
        }).round(2)
        
        # Yearly trends
        region_data['year'] = region_data['date'].dt.year
        yearly_stats = region_data.groupby('year').agg({
            'temperature_c': 'mean',
            'rainfall_mm': 'sum',
            'humidity_percent': 'mean'
        }).round(2)
        
        # Seasonal patterns
        region_data['month'] = region_data['date'].dt.month
        seasonal_stats = region_data.groupby('month').agg({
            'temperature_c': 'mean',
            'rainfall_mm': 'mean',
            'humidity_percent': 'mean'
        }).round(2)
        
        return {
            "region": region,
            "analysis_period": {
                "start": region_data['date'].min().strftime("%Y-%m-%d"),
                "end": region_data['date'].max().strftime("%Y-%m-%d"),
                "total_days": len(region_data)
            },
            "overall_statistics": {
                "avg_temperature_c": round(region_data['temperature_c'].mean(), 2),
                "min_temperature_c": round(region_data['temperature_c'].min(), 2),
                "max_temperature_c": round(region_data['temperature_c'].max(), 2),
                "total_rainfall_mm": round(region_data['rainfall_mm'].sum(), 2),
                "avg_humidity_percent": round(region_data['humidity_percent'].mean(), 2)
            },
            "trends": {
                "temperature_trend": self._calculate_trend(yearly_stats['temperature_c']),
                "rainfall_trend": self._calculate_trend(yearly_stats['rainfall_mm']),
                "humidity_trend": self._calculate_trend(yearly_stats['humidity_percent'])
            },
            "seasonal_patterns": {str(k): v for k, v in seasonal_stats.to_dict().items()},
            "yearly_summary": {str(k): v for k, v in yearly_stats.to_dict().items()}
        }
    
    def analyze_air_quality_trends(self, region: str) -> Dict:
        """Analyze air quality trends and health impacts"""
        if self.air_quality_data is None:
            return {"error": "Air quality data not available"}
        
        region_data = self.air_quality_data[self.air_quality_data['region'] == region].copy()
        
        if region_data.empty:
            return {"error": f"No air quality data available for {region}"}
        
        # AQI category distribution
        category_dist = region_data['aqi_category'].value_counts()
        
        # Monthly trends
        region_data['year_month'] = region_data['date'].dt.to_period('M')
        monthly_aqi = region_data.groupby('year_month')['aqi'].mean().round(1)
        
        # Health risk assessment
        unhealthy_days = len(region_data[region_data['aqi'] > 100])
        total_days = len(region_data)
        health_risk_percentage = (unhealthy_days / total_days) * 100
        
        # Pollutant analysis
        pollutant_stats = {
            'pm25': {
                'average': round(region_data['pm25_ugm3'].mean(), 1),
                'max': round(region_data['pm25_ugm3'].max(), 1),
                'days_above_who_limit': len(region_data[region_data['pm25_ugm3'] > 15])  # WHO guideline
            },
            'pm10': {
                'average': round(region_data['pm10_ugm3'].mean(), 1),
                'max': round(region_data['pm10_ugm3'].max(), 1),
                'days_above_who_limit': len(region_data[region_data['pm10_ugm3'] > 45])  # WHO guideline
            }
        }
        
        return {
            "region": region,
            "analysis_period": {
                "start": region_data['date'].min().strftime("%Y-%m-%d"),
                "end": region_data['date'].max().strftime("%Y-%m-%d"),
                "total_days": total_days
            },
            "aqi_summary": {
                "average_aqi": round(region_data['aqi'].mean(), 1),
                "min_aqi": round(region_data['aqi'].min(), 1),
                "max_aqi": round(region_data['aqi'].max(), 1),
                "category_distribution": category_dist.to_dict()
            },
            "health_assessment": {
                "unhealthy_days": unhealthy_days,
                "health_risk_percentage": round(health_risk_percentage, 1),
                "recommendation": self._get_health_recommendation(health_risk_percentage)
            },
            "pollutant_analysis": pollutant_stats,
            "monthly_trends": {str(k): v for k, v in monthly_aqi.to_dict().items()}
        }
    
    def generate_flood_risk_assessment(self, region: str) -> Dict:
        """Generate comprehensive flood risk assessment"""
        assessment = {
            "region": region,
            "assessment_date": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Historical flood analysis
        if self.flood_events is not None:
            region_floods = self.flood_events[self.flood_events['region'] == region]
            if not region_floods.empty:
                assessment["historical_analysis"] = {
                    "total_events": len(region_floods),
                    "severity_breakdown": region_floods['severity'].value_counts().to_dict(),
                    "average_affected_area_km2": round(region_floods['affected_area_km2'].mean(), 1),
                    "last_major_event": {
                        "date": region_floods.loc[region_floods['severity'] == 'Severe', 'date'].max().strftime("%Y-%m-%d") if not region_floods[region_floods['severity'] == 'Severe'].empty else "None",
                        "severity": "Severe" if not region_floods[region_floods['severity'] == 'Severe'].empty else "None"
                    }
                }
        
        # Risk factors analysis
        if self.flood_risk_factors is not None:
            region_risk = self.flood_risk_factors[self.flood_risk_factors['region'] == region]
            if not region_risk.empty:
                risk_data = region_risk.iloc[0]
                assessment["risk_factors"] = {
                    "overall_risk_score": risk_data['overall_flood_risk_score'],
                    "risk_category": risk_data['risk_category'],
                    "contributing_factors": {
                        "elevation_risk": risk_data['elevation_risk_factor'],
                        "population_density_risk": risk_data['population_risk_factor'],
                        "water_proximity_risk": risk_data['water_proximity_risk_factor'],
                        "drainage_infrastructure": risk_data['drainage_infrastructure_score']
                    },
                    "recommendations": self._get_flood_recommendations(risk_data['overall_flood_risk_score'])
                }
        
        # Weather pattern analysis for flood prediction
        if self.weather_data is not None:
            region_weather = self.weather_data[self.weather_data['region'] == region]
            if not region_weather.empty:
                # Analyze rainfall patterns
                recent_rainfall = region_weather.tail(90)['rainfall_mm']  # Last 90 days
                high_rainfall_days = len(recent_rainfall[recent_rainfall > 20])  # Days with >20mm
                
                assessment["weather_patterns"] = {
                    "recent_heavy_rainfall_days": high_rainfall_days,
                    "average_daily_rainfall_mm": round(recent_rainfall.mean(), 2),
                    "max_daily_rainfall_mm": round(recent_rainfall.max(), 2),
                    "rainfall_trend": "Increasing" if recent_rainfall.tail(30).mean() > recent_rainfall.head(30).mean() else "Decreasing"
                }
        
        return assessment
    
    def export_analysis_report(self, region: str, output_file: str = None) -> str:
        """Generate comprehensive analysis report for a region"""
        if output_file is None:
            output_file = f"/home/runner/work/EcoSentinel/EcoSentinel/data/analysis_report_{region}_{datetime.now().strftime('%Y%m%d')}.json"
        
        report = {
            "report_metadata": {
                "title": f"EcoSentinel AI Environmental Analysis Report - {region}",
                "generated_date": datetime.now().isoformat(),
                "region": region,
                "version": "1.0.0"
            },
            "regional_summary": self.get_region_summary(region),
            "climate_analysis": self.analyze_climate_trends(region),
            "air_quality_analysis": self.analyze_air_quality_trends(region),
            "flood_risk_assessment": self.generate_flood_risk_assessment(region)
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        return output_file
    
    def _calculate_trend(self, series: pd.Series) -> str:
        """Calculate trend direction from time series data"""
        if len(series) < 2:
            return "Insufficient data"
        
        # Simple linear trend calculation
        x = np.arange(len(series))
        slope = np.polyfit(x, series.values, 1)[0]
        
        if slope > 0.1:
            return "Increasing"
        elif slope < -0.1:
            return "Decreasing"
        else:
            return "Stable"
    
    def _get_health_recommendation(self, risk_percentage: float) -> str:
        """Get health recommendation based on air quality risk percentage"""
        if risk_percentage < 10:
            return "Low risk - Air quality is generally good for outdoor activities"
        elif risk_percentage < 25:
            return "Moderate risk - Sensitive individuals should limit prolonged outdoor exertion"
        elif risk_percentage < 50:
            return "High risk - Everyone should limit prolonged outdoor activities"
        else:
            return "Very high risk - Avoid outdoor activities when possible"
    
    def _get_flood_recommendations(self, risk_score: float) -> List[str]:
        """Get flood risk recommendations based on risk score"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.extend([
                "Implement early warning systems",
                "Improve drainage infrastructure",
                "Develop evacuation plans",
                "Consider flood-resistant construction"
            ])
        elif risk_score > 0.4:
            recommendations.extend([
                "Monitor rainfall patterns closely",
                "Maintain existing drainage systems",
                "Prepare emergency response plans"
            ])
        else:
            recommendations.extend([
                "Continue regular monitoring",
                "Maintain preventive measures"
            ])
        
        return recommendations

def main():
    """Demo the analysis capabilities"""
    print("🌍 EcoSentinel AI - Environmental Data Analysis Demo")
    print("=" * 55)
    
    analyzer = EcoDataAnalyzer()
    
    # Demo region
    region = "Nairobi"
    print(f"\n📍 Analyzing environmental data for {region}...")
    
    # Generate comprehensive report
    report_file = analyzer.export_analysis_report(region)
    print(f"✅ Analysis report generated: {report_file}")
    
    # Show summary
    summary = analyzer.get_region_summary(region)
    print(f"\n📊 Summary for {region}:")
    
    if "weather" in summary:
        weather = summary["weather"]
        print(f"   🌡️  Average Temperature: {weather['avg_temperature_c']}°C")
        print(f"   🌧️  Total Rainfall (30 days): {weather['total_rainfall_mm']}mm")
        print(f"   💨 Average Humidity: {weather['avg_humidity_percent']}%")
    
    if "air_quality" in summary:
        aqi = summary["air_quality"]
        print(f"   🌫️  Average AQI: {aqi['avg_aqi']} ({aqi['dominant_category']})")
        print(f"   🏭 PM2.5: {aqi['avg_pm25_ugm3']}µg/m³")
    
    if "flood_risk" in summary:
        flood = summary["flood_risk"]
        print(f"   🌊 Flood Risk: {flood['risk_category']} ({flood['overall_risk_score']})")
    
    print(f"\n🎯 Analysis complete! Full report available at:")
    print(f"   {report_file}")

if __name__ == "__main__":
    main()