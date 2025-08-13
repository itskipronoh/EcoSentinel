# EcoSentinel AI - Environmental Data Directory

This directory contains environmental datasets and analysis tools for the EcoSentinel AI platform. The data enables comprehensive environmental risk assessment and prediction for Kenyan communities.

## 📊 Available Datasets

### Core Environmental Data
- **`datasets/weather_data.csv`** - Daily weather measurements (2020-2024)
- **`datasets/air_quality_data.csv`** - Daily air quality measurements and AQI calculations
- **`datasets/flood_events.csv`** - Historical flood events with impact assessment
- **`datasets/flood_risk_factors.csv`** - Regional flood risk assessment factors
- **`datasets/environmental_indicators.csv`** - Environmental health indicators by region
- **`datasets/metadata.json`** - Dataset metadata and descriptions

### Analysis Tools
- **`generate_sample_data.py`** - Sample environmental data generator
- **`data_analyzer.py`** - Environmental data analysis toolkit

## 🌍 Geographic Coverage

The datasets cover 10 major regions across Kenya:
- **Nairobi** - Capital city and major urban center
- **Mombasa** - Coastal region and port city
- **Kisumu** - Lake Victoria region
- **Eldoret** - Highland agricultural region
- **Nakuru** - Rift Valley region
- **Nyeri** - Central highlands
- **Machakos** - Eastern region
- **Kitui** - Semi-arid eastern region
- **Turkana** - Arid northern region
- **Mandera** - Arid northeastern border region

## 📈 Data Specifications

### Weather Data
- **Temporal Resolution**: Daily (2020-2024)
- **Parameters**: Temperature, rainfall, humidity, wind speed, pressure
- **Records**: 18,270 observations across all regions

### Air Quality Data
- **Temporal Resolution**: Daily (2020-2024)
- **Parameters**: PM2.5, PM10, NO2, SO2, O3, AQI calculations
- **Health Categories**: Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous

### Flood Risk Data
- **Historical Events**: 9 documented flood events (2020-2024)
- **Risk Factors**: Elevation, population density, water proximity, drainage infrastructure
- **Impact Assessment**: Affected area, population impact, economic damage

### Environmental Indicators
- **Forest Cover**: Percentage by region
- **Water Quality Index**: 1-100 scale (higher = better)
- **Soil Health Index**: 1-100 scale (higher = better)
- **Biodiversity Index**: Species richness proxy
- **Waste Management Score**: Infrastructure assessment

## 🔧 Usage

### Data Generation
Generate fresh sample datasets:
```bash
python data/generate_sample_data.py
```

### Data Analysis
Analyze environmental data for any region:
```bash
python data/data_analyzer.py
```

### Programmatic Access
```python
from data.data_analyzer import EcoDataAnalyzer

# Initialize analyzer
analyzer = EcoDataAnalyzer()

# Get regional summary
summary = analyzer.get_region_summary("Nairobi")

# Analyze climate trends
climate_analysis = analyzer.analyze_climate_trends("Nairobi")

# Generate comprehensive report
report_file = analyzer.export_analysis_report("Nairobi")
```

## 📋 Data Quality

- **Completeness**: All regions have data for the full temporal range
- **Accuracy**: Data follows realistic patterns based on Kenya's climate and geography
- **Consistency**: Standardized formats and units across all datasets
- **Validation**: Built-in quality checks and data validation

## 🔄 Data Integration

The datasets are designed to integrate seamlessly with:
- **ML Models** (`../ml_models/ecosentinel_predictor.py`)
- **Demo Application** (`../demo.py`)
- **Web Interface** (`../packages/webapp/`)
- **API Services** (`../packages/api/`)

## 📊 Sample Analysis Report

Each analysis report includes:
- **Regional Summary** - Current environmental status
- **Climate Analysis** - Temperature, rainfall, and humidity trends
- **Air Quality Assessment** - Pollution levels and health impacts
- **Flood Risk Evaluation** - Historical events and risk factors
- **Recommendations** - Actionable environmental guidance

## 🎯 Use Cases

1. **Environmental Monitoring** - Track air quality, weather patterns, and environmental health
2. **Risk Assessment** - Evaluate flood risks and climate vulnerabilities
3. **Policy Planning** - Support evidence-based environmental decisions
4. **Community Alerts** - Provide hyperlocal environmental warnings
5. **Research & Development** - Train and validate ML prediction models

## 📄 Data Sources

The sample datasets are generated to represent realistic patterns based on:
- Kenya Meteorological Department data patterns
- UNEP environmental indicators
- WHO air quality guidelines
- Kenya Open Data Portal statistics
- Scientific literature on Kenya's climate

## ⚖️ Data Usage Terms

The datasets in this directory are provided under the MIT License for research, development, and educational purposes. When using this data:

1. **Attribution**: Credit EcoSentinel AI and the original data sources
2. **Non-commercial**: Sample data is for development and testing only
3. **Accuracy**: Data represents patterns but should not be used for operational decisions
4. **Updates**: Refresh datasets regularly using the generation scripts

## 🔗 Integration with EcoSentinel AI

These datasets enable:
- **Hyperlocal Predictions** - Sub-regional environmental forecasting
- **Voice-Accessible AI** - Natural language environmental guidance
- **Real-time Alerts** - Community-specific risk warnings
- **Decision Support** - Dashboard visualizations and reports

---

**🌱 "From Kibera to Kisumu — EcoSentinel AI makes environmental data accessible to all."**

## Disclaimer

The documents and datasets used in this sample contain information generated for demonstration purposes and do not reflect actual environmental conditions. The information is only for demonstration purposes and does not reflect the opinions or beliefs of any organization. No representations or warranties of any kind, express or implied, are made about the completeness, accuracy, reliability, suitability or availability with respect to the information contained in these datasets.
