#!/usr/bin/env python3
"""
Setup script for EcoSentinel AI with AccuWeather integration
This script helps set up the environment and dependencies.
"""

import os
import sys
import subprocess
from pathlib import Path

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    
    requirements_file = Path(__file__).parent.parent / "requirements.txt"
    
    if requirements_file.exists():
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
            print("✅ Requirements installed successfully!")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing requirements: {e}")
            return False
    else:
        print(f"❌ Requirements file not found: {requirements_file}")
        return False

def setup_environment():
    """Set up environment variables"""
    print("\n🔧 Setting up environment...")
    
    env_example = Path(__file__).parent / ".env.example"
    env_file = Path(__file__).parent / ".env"
    
    if env_example.exists() and not env_file.exists():
        # Copy example file
        with open(env_example, 'r') as f:
            content = f.read()
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print(f"✅ Created .env file from template")
        print(f"📝 Please edit {env_file} and add your API keys")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("❌ Could not set up environment file")
        return False

def check_api_key():
    """Check if AccuWeather API key is configured"""
    print("\n🔑 Checking API key configuration...")
    
    # Try to load from .env file
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        with open(env_file, 'r') as f:
            content = f.read()
            if "ACCUWEATHER_API_KEY=your_accuweather_api_key_here" not in content:
                if "ACCUWEATHER_API_KEY=" in content:
                    print("✅ AccuWeather API key appears to be configured in .env file")
                    return True
    
    # Check environment variable
    if os.getenv('ACCUWEATHER_API_KEY'):
        print("✅ AccuWeather API key found in environment variables")
        return True
    
    print("⚠️  AccuWeather API key not configured")
    print("   The system will use simulated weather data")
    print("\n💡 To get real weather data:")
    print("   1. Get a free API key from: https://developer.accuweather.com/")
    print("   2. Edit the .env file and replace 'your_accuweather_api_key_here' with your actual key")
    print("   3. Or set environment variable: export ACCUWEATHER_API_KEY=your_key")
    
    return False

def run_tests():
    """Run basic tests"""
    print("\n🧪 Running basic tests...")
    
    try:
        # Test imports
        import numpy
        import pandas
        import requests
        print("✅ Core dependencies imported successfully")
        
        # Test predictor import
        from ecosentinel_predictor import EcoSentinelPredictor, AccuWeatherAPI
        print("✅ EcoSentinel modules imported successfully")
        
        # Test basic functionality
        predictor = EcoSentinelPredictor()
        success = predictor.load_models()
        if success:
            print("✅ EcoSentinel predictor initialized successfully")
        else:
            print("❌ Error initializing predictor")
            return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def main():
    """Main setup function"""
    print("🌍 EcoSentinel AI - Setup Script")
    print("=" * 40)
    print("This script will help you set up EcoSentinel AI with AccuWeather integration\n")
    
    success_count = 0
    total_steps = 4
    
    # Step 1: Install requirements
    if install_requirements():
        success_count += 1
    
    # Step 2: Set up environment
    if setup_environment():
        success_count += 1
    
    # Step 3: Check API key
    if check_api_key():
        success_count += 1
    
    # Step 4: Run tests
    if run_tests():
        success_count += 1
    
    # Summary
    print(f"\n📊 Setup Summary: {success_count}/{total_steps} steps completed successfully")
    
    if success_count == total_steps:
        print("🎉 Setup completed successfully!")
        print("\n🚀 Next steps:")
        print("   1. Run: python ecosentinel_predictor.py")
        print("   2. Or run: python test_weather_api.py to test AccuWeather integration")
    elif success_count >= 2:
        print("✅ Basic setup completed. Some optional features may not be available.")
        print("\n🚀 You can still run:")
        print("   python ecosentinel_predictor.py")
    else:
        print("❌ Setup encountered major issues. Please check the errors above.")
    
    print("\n📚 Documentation:")
    print("   • AccuWeather API: https://developer.accuweather.com/")
    print("   • EcoSentinel AI: Check the README.md file")

if __name__ == "__main__":
    main()
