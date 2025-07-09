#!/usr/bin/env python3
"""
EcoSentinel AI - Quick Demo
Copyright (c) 2025 Gideon Kiprono

Quick demonstration of EcoSentinel AI environmental prediction capabilities.
Run this script to see sample predictions for various Kenyan locations.
"""

import sys
import os

# Add the ml_models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml_models'))

try:
    from ecosentinel_predictor import EcoSentinelPredictor
    print("✅ EcoSentinel AI modules loaded successfully!")
except ImportError:
    print("❌ Error: Could not load EcoSentinel AI modules.")
    print("Please ensure you have installed the required dependencies:")
    print("pip install -r requirements.txt")
    sys.exit(1)

def demo_predictions():
    """Run demo predictions for various Kenyan locations"""
    
    print("\n" + "="*60)
    print("🌍 ECOSENTINEL AI - ENVIRONMENTAL INTELLIGENCE DEMO")
    print("Democratizing environmental data across Kenya")
    print("="*60)
    
    predictor = EcoSentinelPredictor()
    
    if not predictor.load_models():
        print("❌ Failed to load prediction models")
        return
    
    # Demo locations across Kenya
    locations = [
        {"name": "Nairobi (Kibera)", "lat": -1.3133, "lon": 36.7833},
        {"name": "Kisumu", "lat": -0.0917, "lon": 34.7680},
        {"name": "Eldoret", "lat": 0.5143, "lon": 35.2698},
        {"name": "Mandera", "lat": 3.9366, "lon": 41.8670},
        {"name": "Mombasa", "lat": -4.0435, "lon": 39.6682}
    ]
    
    for i, location in enumerate(locations, 1):
        print(f"\n📍 {i}. ANALYZING: {location['name']}")
        print("-" * 40)
        
        # Flood risk assessment
        print("🌊 Flood Risk Assessment:")
        flood_data = predictor.predict_flood_risk(
            latitude=location['lat'],
            longitude=location['lon'],
            rainfall_24h=65.0,  # Moderate rainfall
            elevation=1200,     # Average elevation
            soil_type="loam"
        )
        
        print(f"   Risk Level: {flood_data['risk_level']} ({flood_data['risk_score']:.2f})")
        print(f"   Recommendation: {flood_data['recommendations'][0]}")
        
        # Air quality forecast
        print("\n🌫️ Air Quality Forecast:")
        aqi_data = predictor.predict_air_quality(
            latitude=location['lat'],
            longitude=location['lon'],
            hours_ahead=12
        )
        
        print(f"   Average AQI: {aqi_data['average_aqi']} ({aqi_data['predictions'][0]['category']})")
        print(f"   Health Advice: {aqi_data['health_recommendations'][0]}")
        
        # Deforestation risk
        print("\n🌳 Deforestation Risk:")
        deforest_data = predictor.analyze_deforestation_risk(
            latitude=location['lat'],
            longitude=location['lon'],
            area_km2=2.0
        )
        
        print(f"   Risk Level: {deforest_data['risk_level']} ({deforest_data['deforestation_risk']:.2f})")
        print(f"   Action: {deforest_data['conservation_actions'][0]}")
        
        if i < len(locations):
            input("\nPress Enter to continue to next location...")
    
    print("\n" + "="*60)
    print("🎯 DEMO COMPLETE!")
    print("\nEcoSentinel AI provides:")
    print("• Real-time environmental risk assessments")
    print("• Hyperlocal predictions for communities")
    print("• Actionable recommendations in local languages")
    print("• Voice-accessible guidance via phone hotline")
    print("\n🌱 From Kibera to Kisumu, Eldoret to Mandera")
    print("   EcoSentinel AI makes environmental data accessible to all.")
    print("="*60)

def interactive_demo():
    """Interactive demo where user can input custom coordinates"""
    
    print("\n🔧 CUSTOM LOCATION ANALYSIS")
    print("Enter coordinates for a custom environmental assessment")
    
    try:
        lat = float(input("Enter latitude (e.g., -1.2921 for Nairobi): "))
        lon = float(input("Enter longitude (e.g., 36.8219 for Nairobi): "))
        rainfall = float(input("Enter 24h rainfall in mm (e.g., 45.5): "))
        
        print(f"\n🔍 Analyzing location: {lat:.4f}, {lon:.4f}")
        
        predictor = EcoSentinelPredictor()
        predictor.load_models()
        
        # Comprehensive analysis
        flood_result = predictor.predict_flood_risk(lat, lon, rainfall, 1500, "loam")
        aqi_result = predictor.predict_air_quality(lat, lon, 6)
        deforest_result = predictor.analyze_deforestation_risk(lat, lon, 1.0)
        
        print("\n📊 ENVIRONMENTAL RISK SUMMARY")
        print("-" * 30)
        print(f"🌊 Flood Risk: {flood_result['risk_level']} ({flood_result['risk_score']:.2f})")
        print(f"🌫️ Air Quality: {aqi_result['average_aqi']} AQI")
        print(f"🌳 Deforestation: {deforest_result['risk_level']} ({deforest_result['deforestation_risk']:.2f})")
        
        print("\n💡 KEY RECOMMENDATIONS:")
        print(f"• {flood_result['recommendations'][0]}")
        print(f"• {aqi_result['health_recommendations'][0]}")
        print(f"• {deforest_result['conservation_actions'][0]}")
        
    except ValueError:
        print("❌ Invalid input. Please enter numeric values.")
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted by user.")

def main():
    """Main demo function"""
    
    print("🌍 Welcome to EcoSentinel AI Demo!")
    print("\nChoose an option:")
    print("1. Run preset location demos")
    print("2. Analyze custom coordinates")
    print("3. Exit")
    
    try:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            demo_predictions()
        elif choice == "2":
            interactive_demo()
        elif choice == "3":
            print("👋 Thank you for trying EcoSentinel AI!")
            print("Visit: https://github.com/itskipronoh/EcoSentinel")
        else:
            print("❌ Invalid choice. Please run the demo again.")
            
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted. Thank you for trying EcoSentinel AI!")

if __name__ == "__main__":
    main()
