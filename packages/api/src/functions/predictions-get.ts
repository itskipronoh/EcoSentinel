import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ok } from '../http-response.js';

export async function predictionsGet(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'Nairobi';
    const period = url.searchParams.get('period') || '24h';
    const type = url.searchParams.get('type') || 'all';

    // Generate prediction data based on period
    let labels: string[] = [];
    let dataPoints = 0;

    switch (period) {
      case '24h':
        dataPoints = 24;
        labels = Array.from({length: 24}, (_, i) => {
          const now = new Date();
          now.setHours(now.getHours() + i);
          return now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        });
        break;
      case '7d':
        dataPoints = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case '30d':
        dataPoints = 30;
        labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
        break;
      default:
        dataPoints = 24;
        labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    }

    // Location-specific base values with consistent seeded generation
    const now = new Date();
    const hourSeed = Math.floor(now.getTime() / (1000 * 60 * 10)); // Changes every 10 minutes
    const locationSeed = location.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseSeed = (hourSeed + locationSeed) % 1000;
    
    // Seeded random function for consistent variations
    function seededRandom(seed: number): number {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    const locationFactors: Record<string, { airBase: number; floodBase: number }> = {
      'mathare': { airBase: 180, floodBase: 0.7 },
      'kibera': { airBase: 190, floodBase: 0.9 },
      'kawangware': { airBase: 150, floodBase: 0.8 },
      'westlands': { airBase: 95, floodBase: 0.3 },
      'nairobi': { airBase: 140, floodBase: 0.5 },
      'embakasi': { airBase: 145, floodBase: 0.3 },
      'kasarani': { airBase: 95, floodBase: 0.2 }
    };

    const factors = locationFactors[location.toLowerCase()] || locationFactors['nairobi'];

    // Generate realistic prediction data with trends but consistent patterns
    const floodRisk = Array.from({length: dataPoints}, (_, i) => {
      const timeTrend = period === '24h' ? Math.sin(i/4) * 0.3 : 0;
      const seedValue = seededRandom(baseSeed + i) * 0.2 - 0.1; // ±0.1 variation
      return Math.max(0.1, Math.min(1.0, factors.floodBase + timeTrend + seedValue));
    });

    const airQuality = Array.from({length: dataPoints}, (_, i) => {
      const timeTrend = period === '24h' ? Math.sin(i/3) * 30 : 0;
      const seedValue = seededRandom(baseSeed + i + 100) * 40 - 20; // ±20 variation
      return Math.max(50, Math.min(300, factors.airBase + timeTrend + seedValue));
    });

    const deforestation = Array.from({length: dataPoints}, (_, i) => {
      const baseDeforest = factors.floodBase * 0.6; // Correlate with flood risk
      const seedValue = seededRandom(baseSeed + i + 200) * 0.3 - 0.15;
      return Math.max(0.1, Math.min(1.0, baseDeforest + seedValue));
    });

    const temperature = Array.from({length: dataPoints}, (_, i) => {
      const dailyCycle = period === '24h' ? Math.sin((i - 6) * Math.PI / 12) * 5 : 0;
      const seedValue = seededRandom(baseSeed + i + 300) * 6 - 3; // ±3°C variation
      return Math.max(15, Math.min(35, 24 + dailyCycle + seedValue));
    });

    const predictionData = {
      location: location,
      period: period,
      timestamp: new Date().toISOString(),
      labels: labels,
      predictions: {
        floodRisk: floodRisk,
        airQuality: airQuality,
        deforestation: deforestation,
        temperature: temperature
      } as Record<string, number[]>,
      metadata: {
        confidence: 0.87,
        modelVersion: "1.2.3",
        dataSource: "EcoSentinel ML Engine"
      }
    };

    // Filter by type if specified
    if (type !== 'all' && predictionData.predictions[type]) {
      return ok({
        location: predictionData.location,
        period: predictionData.period,
        timestamp: predictionData.timestamp,
        labels: predictionData.labels,
        [type]: predictionData.predictions[type],
        metadata: predictionData.metadata
      });
    }

    return ok(predictionData);

  } catch (error: any) {
    context.log('Error in predictions-get:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch prediction data', details: error?.message || 'Unknown error' }
    };
  }
}

app.http('predictions-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'predictions',
  handler: predictionsGet,
});
