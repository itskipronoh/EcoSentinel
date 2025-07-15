import * as atlas from 'azure-maps-control';
import Chart from 'chart.js/auto';

// Initialize Azure Maps when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Azure Maps config
	const map = new atlas.Map('mapContainer', {
		center: [36.8219, -1.2921], // Nairobi
		zoom: 11,
		style: 'satellite_road_labels',
		authOptions: {
			authType: import.meta.env.VITE_AUTH_TYPE,
			subscriptionKey: import.meta.env.VITE_SUBSCRIPTION_KEY,
		},
	});

	map.events.add('ready', () => {
		const dataSource = new atlas.source.DataSource();
		map.sources.add(dataSource);

		const locations = [
			{
				lng: 36.8219, lat: -1.2921, size: 30, color: '#4CAF50', name: 'Nairobi Central',
			},
			{
				lng: 36.8172, lat: -1.274, size: 20, color: '#8BC34A', name: 'Westlands',
			},
			{
				lng: 36.8537, lat: -1.3098, size: 15, color: '#4CAF50', name: 'Embakasi',
			},
			{
				lng: 36.8566, lat: -1.2699, size: 25, color: '#FFC107', name: 'Mathare',
			},
			{
				lng: 36.7816, lat: -1.3127, size: 35, color: '#FF9800', name: 'Kibera',
			},
			{
				lng: 36.8795, lat: -1.224, size: 12, color: '#4CAF50', name: 'Kasarani',
			},
		];

		for (const loc of locations) {
			const point = new atlas.data.Feature(new atlas.data.Point([loc.lng, loc.lat]), {
				name: loc.name,
				color: loc.color,
				size: loc.size,
			});
			dataSource.add(point);
		}

		map.layers.add(
			new atlas.layer.BubbleLayer(dataSource, undefined, {
				radius: ['case', ['has', 'size'], ['/', ['get', 'size'], 2], 8],
				color: ['case', ['has', 'color'], ['get', 'color'], '#4CAF50'],
				strokeColor: '#fff',
				strokeWidth: 2,
				opacity: 0.7,
			}),
		);

		const popup = new atlas.Popup();
		map.events.add('click', e => {
			const shapes = map.layers.getRenderedShapes(e.position);
			if (shapes.length > 0) {
				const shape = shapes[0];
				// Use 'properties' field directly for Feature, or 'getProperties()' for Shape
				const properties
          = (shape as any).properties
          ?? (typeof (shape as any).getProperties === 'function' ? (shape as any).getProperties() : {});
				let coordinates;
				if (typeof (shape as any).getCoordinates === 'function') {
					coordinates = (shape as any).getCoordinates();
				} else if ((shape as any).geometry?.coordinates) {
					coordinates = (shape as any).geometry.coordinates;
				} else {
					coordinates = [0, 0]; // Fallback
				}

				popup.setOptions({
					content: `<div style="padding: 10px;"><strong>${properties.name}</strong><br/>Environmental Monitoring Point</div>`,
					position: coordinates,
					pixelOffset: [0, -10],
				});
				popup.open(map);
			}
		});
	});

	// Chart.js dashboard
	const context = (document.querySelector('#environmentalChart') as HTMLCanvasElement | null)?.getContext('2d');
	if (context) {
		new Chart(context, {
			type: 'line',
			data: {
				labels: ['Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25'],
				datasets: [
					{
						label: 'Planting',
						data: [8, 24, 19, 17, 22],
						borderColor: '#2E7D32',
						backgroundColor: 'rgba(46,125,50,0.08)',
						borderWidth: 2,
						tension: 0.3,
						pointRadius: 0,
					},
					{
						label: 'Pollution Alerts',
						data: [5, 10, 8, 14, 16],
						borderColor: '#4CAF50',
						backgroundColor: 'rgba(76,175,80,0.08)',
						borderWidth: 2,
						tension: 0.3,
						pointRadius: 0,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {},
						ticks: {maxTicksLimit: 5},
						title: {display: true, text: 'Alerts'},
					},
					x: {
						grid: {display: false},
						title: {display: true, text: 'Date'},
					},
				},
			},
		});
	}
});
