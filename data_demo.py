#!/usr/bin/env python3
"""
EcoSentinel AI - Data Analysis Demo
Copyright (c) 2025 Gideon Kiprono & EcoSentinel AI Team

Quick demonstration of the new environmental data analysis capabilities.
"""

import sys
import os

# Add the data directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'data'))

def main():
    """Demo the new data analysis capabilities"""
    
    print("🌍 EcoSentinel AI - Data Analysis Demo")
    print("=" * 45)
    print("Demonstrating new environmental data capabilities")
    print()
    
    try:
        from data_analyzer import EcoDataAnalyzer
        
        analyzer = EcoDataAnalyzer()
        
        # Demo regions
        regions = ["Nairobi", "Mombasa", "Kisumu"]
        
        for region in regions:
            print(f"📍 {region.upper()} ENVIRONMENTAL SUMMARY")
            print("-" * 40)
            
            summary = analyzer.get_region_summary(region)
            
            if "weather" in summary:
                weather = summary["weather"]
                print(f"🌡️  Temperature: {weather['avg_temperature_c']}°C")
                print(f"🌧️  Rainfall (30d): {weather['total_rainfall_mm']}mm")
                print(f"💨 Humidity: {weather['avg_humidity_percent']}%")
            
            if "air_quality" in summary:
                aqi = summary["air_quality"]
                print(f"🌫️  Air Quality: {aqi['avg_aqi']} AQI ({aqi['dominant_category']})")
                print(f"🏭 PM2.5: {aqi['avg_pm25_ugm3']}µg/m³")
            
            if "flood_risk" in summary:
                flood = summary["flood_risk"]
                print(f"🌊 Flood Risk: {flood['risk_category']} ({flood['overall_risk_score']})")
            
            if "environmental_health" in summary:
                env = summary["environmental_health"]
                print(f"🌳 Forest Cover: {env['forest_cover_percent']}%")
                print(f"💧 Water Quality: {env['water_quality_index']}/100")
            
            print()
        
        print("✅ Data analysis demo complete!")
        print("\nAvailable tools:")
        print("• python data/generate_sample_data.py - Generate environmental datasets")
        print("• python data/data_analyzer.py - Comprehensive data analysis")
        print("• python data/validate_integration.py - Validate system integration")
        print("\n🌱 Environmental intelligence for all Kenyan communities")
        
    except ImportError:
        print("❌ Error: Data analyzer not available")
        print("Run: python data/generate_sample_data.py first")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()