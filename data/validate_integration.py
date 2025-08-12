#!/usr/bin/env python3
"""
EcoSentinel AI - Data Integration Validator
Copyright (c) 2025 Gideon Kiprono & EcoSentinel AI Team

This script validates data integration between the environmental datasets
and the ML prediction models, ensuring everything works together seamlessly.
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime
import json

# Add the ml_models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '../ml_models'))

def test_data_availability():
    """Test if all datasets are available and properly formatted"""
    print("🔍 Testing data availability...")
    
    data_dir = "/home/runner/work/EcoSentinel/EcoSentinel/data/datasets"
    required_files = [
        "weather_data.csv",
        "air_quality_data.csv", 
        "flood_events.csv",
        "flood_risk_factors.csv",
        "environmental_indicators.csv",
        "metadata.json"
    ]
    
    missing_files = []
    available_files = []
    
    for file in required_files:
        file_path = os.path.join(data_dir, file)
        if os.path.exists(file_path):
            available_files.append(file)
            print(f"   ✅ {file}")
        else:
            missing_files.append(file)
            print(f"   ❌ {file}")
    
    return len(missing_files) == 0, available_files, missing_files

def test_data_integration():
    """Test integration between datasets and ML models"""
    print("\n🔧 Testing data integration with ML models...")
    
    try:
        from ecosentinel_predictor import EcoSentinelPredictor
        
        predictor = EcoSentinelPredictor()
        models_loaded = predictor.load_models()
        
        if models_loaded:
            print("   ✅ ML models loaded successfully")
            return True
        else:
            print("   ❌ Failed to load ML models")
            return False
            
    except ImportError as e:
        print(f"   ❌ Cannot import ML predictor: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error loading models: {e}")
        return False

def test_data_analyzer():
    """Test the data analyzer functionality"""
    print("\n📊 Testing data analyzer...")
    
    try:
        sys.path.append('/home/runner/work/EcoSentinel/EcoSentinel/data')
        from data_analyzer import EcoDataAnalyzer
        
        analyzer = EcoDataAnalyzer()
        
        # Test with Nairobi
        summary = analyzer.get_region_summary("Nairobi")
        
        if "region" in summary and summary["region"] == "Nairobi":
            print("   ✅ Data analyzer working correctly")
            return True
        else:
            print("   ❌ Data analyzer not working correctly")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing data analyzer: {e}")
        return False

def validate_data_quality():
    """Validate the quality and consistency of datasets"""
    print("\n📋 Validating data quality...")
    
    data_dir = "/home/runner/work/EcoSentinel/EcoSentinel/data/datasets"
    issues = []
    
    try:
        # Load weather data
        weather_df = pd.read_csv(f"{data_dir}/weather_data.csv")
        weather_df['date'] = pd.to_datetime(weather_df['date'])
        
        # Check for missing values
        missing_weather = weather_df.isnull().sum()
        if missing_weather.sum() > 0:
            issues.append(f"Weather data has {missing_weather.sum()} missing values")
        
        # Check date range
        date_range = weather_df['date'].max() - weather_df['date'].min()
        if date_range.days < 1460:  # Less than 4 years
            issues.append(f"Weather data covers only {date_range.days} days")
        
        # Load air quality data
        aqi_df = pd.read_csv(f"{data_dir}/air_quality_data.csv")
        aqi_df['date'] = pd.to_datetime(aqi_df['date'])
        
        # Check AQI values are reasonable
        invalid_aqi = len(aqi_df[(aqi_df['aqi'] < 0) | (aqi_df['aqi'] > 500)])
        if invalid_aqi > 0:
            issues.append(f"Air quality data has {invalid_aqi} invalid AQI values")
        
        # Check coordinate consistency
        weather_coords = weather_df[['region', 'latitude', 'longitude']].drop_duplicates()
        aqi_coords = aqi_df[['region', 'latitude', 'longitude']].drop_duplicates()
        
        if len(weather_coords) != len(aqi_coords):
            issues.append("Coordinate mismatch between weather and air quality data")
        
        # Load flood data
        flood_df = pd.read_csv(f"{data_dir}/flood_events.csv")
        if len(flood_df) == 0:
            issues.append("No flood events in dataset")
        
        # Report results
        if len(issues) == 0:
            print("   ✅ All data quality checks passed")
            return True
        else:
            print("   ❌ Data quality issues found:")
            for issue in issues:
                print(f"     • {issue}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error validating data quality: {e}")
        return False

def test_full_workflow():
    """Test the complete workflow from data to predictions"""
    print("\n🚀 Testing complete workflow...")
    
    try:
        # Import required modules
        sys.path.append('/home/runner/work/EcoSentinel/EcoSentinel/data')
        from data_analyzer import EcoDataAnalyzer
        from ecosentinel_predictor import EcoSentinelPredictor
        
        # Initialize components
        analyzer = EcoDataAnalyzer()
        predictor = EcoSentinelPredictor()
        predictor.load_models()
        
        # Test region
        test_region = "Nairobi"
        
        # Get data analysis
        summary = analyzer.get_region_summary(test_region)
        climate_analysis = analyzer.analyze_climate_trends(test_region)
        
        # Get ML predictions
        flood_prediction = predictor.predict_flood_risk(-1.2921, 36.8219, 45.0, 1795, "loam")
        aqi_prediction = predictor.predict_air_quality(-1.2921, 36.8219, 12)
        
        # Validate results
        if (summary and "region" in summary and 
            climate_analysis and "region" in climate_analysis and
            flood_prediction and "risk_level" in flood_prediction and
            aqi_prediction and "average_aqi" in aqi_prediction):
            
            print("   ✅ Complete workflow test passed")
            print(f"     • Data summary: {len(summary)} components")
            print(f"     • Climate analysis: {climate_analysis['analysis_period']['total_days']} days")
            print(f"     • Flood prediction: {flood_prediction['risk_level']}")
            print(f"     • AQI prediction: {aqi_prediction['average_aqi']}")
            return True
        else:
            print("   ❌ Workflow test failed - incomplete results")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing workflow: {e}")
        return False

def generate_integration_report():
    """Generate comprehensive integration report"""
    print("\n📄 Generating integration report...")
    
    # Run all tests
    data_available, available_files, missing_files = test_data_availability()
    models_working = test_data_integration()
    analyzer_working = test_data_analyzer()
    data_valid = validate_data_quality()
    workflow_working = test_full_workflow()
    
    # Create report
    report = {
        "integration_report": {
            "title": "EcoSentinel AI Data Integration Validation Report",
            "generated_date": datetime.now().isoformat(),
            "version": "1.0.0"
        },
        "test_results": {
            "data_availability": {
                "status": "PASS" if data_available else "FAIL",
                "available_files": available_files,
                "missing_files": missing_files,
                "total_files": len(available_files) + len(missing_files)
            },
            "ml_models": {
                "status": "PASS" if models_working else "FAIL",
                "description": "ML prediction models integration"
            },
            "data_analyzer": {
                "status": "PASS" if analyzer_working else "FAIL", 
                "description": "Environmental data analysis toolkit"
            },
            "data_quality": {
                "status": "PASS" if data_valid else "FAIL",
                "description": "Data consistency and quality validation"
            },
            "complete_workflow": {
                "status": "PASS" if workflow_working else "FAIL",
                "description": "End-to-end data analysis and prediction workflow"
            }
        },
        "summary": {
            "total_tests": 5,
            "passed_tests": sum([data_available, models_working, analyzer_working, data_valid, workflow_working]),
            "overall_status": "PASS" if all([data_available, models_working, analyzer_working, data_valid, workflow_working]) else "FAIL"
        },
        "recommendations": []
    }
    
    # Add recommendations based on results
    if not data_available:
        report["recommendations"].append("Run data generation script to create missing datasets")
    
    if not models_working:
        report["recommendations"].append("Check ML model dependencies and initialization")
    
    if not analyzer_working:
        report["recommendations"].append("Verify data analyzer module and dependencies")
    
    if not data_valid:
        report["recommendations"].append("Review data quality issues and regenerate if needed")
    
    if not workflow_working:
        report["recommendations"].append("Debug integration between data analysis and ML prediction components")
    
    if report["summary"]["overall_status"] == "PASS":
        report["recommendations"].append("All systems are working correctly - ready for deployment")
    
    # Save report
    report_file = "/home/runner/work/EcoSentinel/EcoSentinel/data/integration_report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"   ✅ Integration report saved: {report_file}")
    return report

def main():
    """Main validation function"""
    print("🌍 EcoSentinel AI - Data Integration Validation")
    print("=" * 50)
    
    # Run comprehensive validation
    report = generate_integration_report()
    
    # Display summary
    print(f"\n🎯 Validation Summary:")
    print(f"   Tests Passed: {report['summary']['passed_tests']}/{report['summary']['total_tests']}")
    print(f"   Overall Status: {report['summary']['overall_status']}")
    
    if report['summary']['overall_status'] == "PASS":
        print("\n✅ All integration tests passed!")
        print("   EcoSentinel AI data infrastructure is ready")
        print("   • Environmental datasets are available and valid")
        print("   • ML prediction models are working")
        print("   • Data analysis tools are functional")
        print("   • Complete workflow is operational")
    else:
        print("\n❌ Integration issues detected:")
        for rec in report['recommendations']:
            print(f"   • {rec}")
    
    print(f"\n📄 Detailed report: data/integration_report.json")

if __name__ == "__main__":
    main()