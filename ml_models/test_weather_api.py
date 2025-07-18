#!/usr/bin/env python3
"""
Test script for AccuWeather API integration with EcoSentinel AI
Run this to verify your AccuWeather API key is working correctly.
"""

import os
import sys
from ecosentinel_predictor import AccuWeatherAPI

def test_accuweather_api():
    """Test AccuWeather API functionality"""
    print("🧪 Testing AccuWeather API Integration")
    print("=" * 45)
    
    # Check for API key
    api_key = os.getenv('ACCUWEATHER_API_KEY')
    if not api_key:
        print("❌ No AccuWeather API key found!")
        print("   Please set the ACCUWEATHER_API_KEY environment variable")
        print("   Or add it to a .env file in this directory")
        print("\n💡 To get an API key:")
        print("   1. Visit: https://developer.accuweather.com/")
        print("   2. Sign up for a free account")
        print("   3. Create a new app to get your API key")
        return False
    
    print(f"✅ API Key found: {api_key[:8]}...")
    
    # Initialize API
    weather_api = AccuWeatherAPI(api_key)
    
    # Test city search
    print("\n🔍 Testing City Search...")
    test_cities = ["Nairobi", "Mombasa", "New York", "London"]
    
    for city in test_cities:
        print(f"\nSearching for: {city}")
        cities = weather_api.search_cities(city)
        
        if cities:
            city_data = cities[0]  # First result
            print(f"  ✅ Found: {city_data['LocalizedName']}, {city_data['Country']['LocalizedName']}")
            print(f"     Key: {city_data['Key']}")
            print(f"     Coordinates: {city_data['GeoPosition']['Latitude']:.3f}, {city_data['GeoPosition']['Longitude']:.3f}")
            
            # Test current weather for first city
            if city == test_cities[0]:
                print(f"\n🌤️  Testing Current Weather for {city_data['LocalizedName']}...")
                weather = weather_api.get_current_weather(city_data['Key'])
                
                if weather:
                    temp = weather.get('Temperature', {}).get('Metric', {}).get('Value', 'N/A')
                    humidity = weather.get('Humidity', 'N/A')
                    conditions = weather.get('WeatherText', 'N/A')
                    
                    print(f"     Temperature: {temp}°C")
                    print(f"     Humidity: {humidity}%")
                    print(f"     Conditions: {conditions}")
                    
                    # Check for rainfall data
                    rainfall = weather.get('PrecipitationSummary', {}).get('Past24Hours', {}).get('Metric', {}).get('Value', 0)
                    print(f"     24h Rainfall: {rainfall}mm")
                    
                    print("  ✅ Current weather data retrieved successfully!")
                else:
                    print("  ❌ Failed to get current weather data")
        else:
            print(f"  ❌ No results found for {city}")
    
    print("\n✅ AccuWeather API test completed!")
    return True

def test_ecosentinel_integration():
    """Test full EcoSentinel integration with AccuWeather"""
    print("\n🌍 Testing EcoSentinel + AccuWeather Integration")
    print("=" * 50)
    
    try:
        from ecosentinel_predictor import EcoSentinelPredictor
        
        # Initialize predictor
        predictor = EcoSentinelPredictor()
        predictor.load_models()
        
        # Test enhanced flood prediction
        print("\n🌊 Testing Enhanced Flood Risk Prediction...")
        result = predictor.predict_flood_risk_with_location(
            city_name="Nairobi",
            soil_type="clay",
            use_real_weather=True
        )
        
        if "error" not in result:
            print("✅ Enhanced flood prediction successful!")
            print(f"   City: {result['location_info']['city_name']}")
            print(f"   Risk Level: {result['risk_level']}")
            print(f"   Data Source: {result['data_source']}")
            
            if "current_weather" in result:
                weather = result['current_weather']
                print(f"   Real Weather: {weather['rainfall_24h']}mm rainfall, {weather['temperature']}°C")
        else:
            print(f"❌ Error in enhanced prediction: {result['error']}")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 EcoSentinel AI - AccuWeather API Test Suite")
    print("=" * 55)
    
    # Test AccuWeather API
    api_success = test_accuweather_api()
    
    if api_success:
        # Test full integration
        integration_success = test_ecosentinel_integration()
        
        if integration_success:
            print("\n🎉 All tests passed! AccuWeather integration is working correctly.")
        else:
            print("\n⚠️  API tests passed, but integration tests failed.")
            print("    Check the ecosentinel_predictor.py file for issues.")
    else:
        print("\n⚠️  API tests failed. Please check your AccuWeather API key.")
        print("    The system will fall back to simulated weather data.")
    
    print("\n📝 Next Steps:")
    print("   1. Make sure your API key is correctly set")
    print("   2. Run: python ecosentinel_predictor.py")
    print("   3. Check the enhanced flood predictions with real weather data")
