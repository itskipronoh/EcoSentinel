# EcoSentinel AI Dashboard

## Overview
EcoSentinel AI is an AI-powered environmental monitoring system designed to provide real-time data and insights on environmental risks. This dashboard allows users to visualize air quality indices, flood risk predictions, and other environmental metrics.

## Project Structure
The project is organized as follows:

```
ecosentinel-ai-dashboard
├── src
│   ├── assets
│   │   ├── css
│   │   │   ├── main.css        # Main styles for the dashboard
│   │   │   └── tailwind.css    # Tailwind CSS framework
│   │   ├── js
│   │   │   ├── app.js          # Main JavaScript entry point
│   │   │   ├── chat.js         # Live chat functionality
│   │   │   ├── map.js          # Azure Maps integration
│   │   │   └── language.js     # Language toggling and localization
│   │   └── icons
│   │       └── favicon.svg      # Favicon for the application
│   ├── components
│   │   ├── Header.js           # Header component
│   │   ├── Sidebar.js          # Sidebar component
│   │   ├── Map.js              # Map component
│   │   ├── StatusCard.js       # Status card component
│   │   └── ChatAssistant.js     # Chat assistant component
│   ├── utils
│   │   ├── api.js              # API utility functions
│   │   ├── azureMaps.js        # Azure Maps utility functions
│   │   └── i18n.js             # Internationalization functions
│   ├── data
│   │   ├── environmentalData.js # Mock environmental data
│   │   └── translations.js      # Translation strings
│   └── index.html              # Main HTML file
├── public
│   └── index.html              # Entry point for deployment
├── package.json                 # npm configuration file
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # Project documentation
```

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ecosentinel-ai-dashboard
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Build the Project**
   To build the project for production, run:
   ```bash
   npm run build
   ```

4. **Run the Development Server**
   To start the development server, run:
   ```bash
   npm start
   ```

5. **Access the Dashboard**
   Open your browser and navigate to `http://localhost:3000` to view the dashboard.

## Usage
- Use the sidebar to navigate between different sections of the dashboard.
- The map section displays real-time environmental data using Azure Maps.
- The status cards provide quick insights into air quality and flood risk.
- The chat assistant allows users to ask questions about environmental risks.
- The language toggle enables switching between supported languages.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.