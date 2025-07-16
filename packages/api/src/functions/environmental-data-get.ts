import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ok } from '../http-response.js';

export async function environmentalDataGet(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'Nairobi';
    const type = url.searchParams.get('type') || 'all';

    // Generate consistent data based on location and current hour (changes slowly)
    const now = new Date();
    const hourSeed = Math.floor(now.getTime() / (1000 * 60 * 10)); // Changes every 10 minutes
    const locationSeed = location.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const combinedSeed = (hourSeed + locationSeed) % 1000;
    
    // Seeded random function for consistent but realistic variations
    function seededRandom(seed: number): number {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    // Base environmental data based on location
    const locationFactors: Record<string, { 
      airBase: number; 
      floodBase: number; 
      forestRisk: number;
      rainfall: number;
      temp: number;
    }> = {
      'mathare': { airBase: 180, floodBase: 0.7, forestRisk: 0.8, rainfall: 25, temp: 23 },
      'kibera': { airBase: 190, floodBase: 0.9, forestRisk: 0.7, rainfall: 30, temp: 24 },
      'kawangware': { airBase: 150, floodBase: 0.8, forestRisk: 0.6, rainfall: 28, temp: 23 },
      'westlands': { airBase: 95, floodBase: 0.3, forestRisk: 0.2, rainfall: 15, temp: 25 },
      'nairobi': { airBase: 140, floodBase: 0.5, forestRisk: 0.4, rainfall: 20, temp: 24 },
      'embakasi': { airBase: 145, floodBase: 0.3, forestRisk: 0.3, rainfall: 18, temp: 25 },
      'kasarani': { airBase: 95, floodBase: 0.2, forestRisk: 0.2, rainfall: 12, temp: 24 },
      'kitengela': { airBase: 110, floodBase: 0.4, forestRisk: 0.3, rainfall: 16, temp: 26 },
      'ruiru': { airBase: 120, floodBase: 0.6, forestRisk: 0.4, rainfall: 22, temp: 23 }
    };

    const baseData = locationFactors[location.toLowerCase()] || locationFactors['nairobi'];
    
    // Add small, consistent variations (±5% change over 10-minute periods)
    const airVariation = (seededRandom(combinedSeed) - 0.5) * 0.1; // ±5%
    const floodVariation = (seededRandom(combinedSeed + 1) - 0.5) * 0.1;
    const rainfallVariation = (seededRandom(combinedSeed + 2) - 0.5) * 0.2;
    const tempVariation = (seededRandom(combinedSeed + 3) - 0.5) * 4; // ±2°C
    
    // Calculate current values with small variations
    const currentTime = new Date();
    const airQuality = Math.max(50, Math.min(300, Math.floor(baseData.airBase * (1 + airVariation))));
    const floodRiskScore = Math.max(0.1, Math.min(1.0, baseData.floodBase + floodVariation));
    const currentRainfall = Math.max(0, baseData.rainfall * (1 + rainfallVariation));
    const currentTemp = Math.max(15, Math.min(35, baseData.temp + tempVariation));
    
    const environmentalData = {
      location: location,
      timestamp: currentTime.toISOString(),
      airQuality: {
        aqi: airQuality,
        level: airQuality > 150 ? 'UNHEALTHY' : airQuality > 100 ? 'MODERATE' : 'GOOD',
        pm25: Math.floor(airQuality * 0.3),
        pm10: Math.floor(airQuality * 0.6),
        lastUpdate: currentTime.toISOString()
      },
      floodRisk: {
        level: floodRiskScore > 0.7 ? 'HIGH' : floodRiskScore > 0.4 ? 'MEDIUM' : 'LOW',
        probability: (floodRiskScore * 100).toFixed(0),
        riskScore: floodRiskScore.toFixed(2),
        confidence: 0.87,
        lastUpdate: currentTime.toISOString()
      },
      forestCover: {
        status: baseData.forestRisk > 0.6 ? 'HIGH' : baseData.forestRisk > 0.3 ? 'MEDIUM' : 'LOW',
        deforestationRisk: baseData.forestRisk.toFixed(2),
        treesCovered: Math.floor(90 - (baseData.forestRisk * 30)),
        lastUpdate: currentTime.toISOString()
      },
      weather: {
        temperature: Math.floor(currentTemp),
        humidity: Math.floor(60 + (seededRandom(combinedSeed + 4) * 20)), // 60-80%
        rainfall24h: currentRainfall.toFixed(1),
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(seededRandom(combinedSeed + 5) * 4)],
        lastUpdate: currentTime.toISOString()
      }
    };

    // Filter data based on type parameter
    if (type !== 'all') {
      const filteredData: any = { 
        location: environmentalData.location,
        timestamp: environmentalData.timestamp
      };
      if ((environmentalData as any)[type]) {
        filteredData[type] = (environmentalData as any)[type];
      }
      return ok(filteredData);
    }

    return ok(environmentalData);

  } catch (error: any) {
    context.log('Error in environmental-data-get:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch environmental data', details: error?.message || 'Unknown error' }
    };
  }
}

app.http('environmental-data-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'environmental-data',
  handler: environmentalDataGet,
});
