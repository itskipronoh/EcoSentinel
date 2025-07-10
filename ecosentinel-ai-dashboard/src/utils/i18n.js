// This file manages internationalization and localization for the application.

const translations = {
  en: {
    dashboard: 'Dashboard',
    airQuality: 'Air Quality',
    floodRisk: 'Flood Risk',
    heatwave: 'Heatwave',
    biodiversity: 'Biodiversity',
    chatPlaceholder: 'Ask about environmental risks in your area...',
    chatTitle: 'EcoSentinel AI Assistant',
    mapTitle: 'Environmental Monitoring Map',
    liveData: 'Live Data',
    aqiTitle: 'Air Quality Index',
    floodTitle: 'Flood Risk Level',
    heatIndex: 'Heat Index',
    forestCover: 'Forest Cover',
    waterQuality: 'Water Quality',
    activeAlerts: 'Active Alerts'
  },
  sw: {
    dashboard: 'Dashibodi',
    airQuality: 'Ubora wa Hewa',
    floodRisk: 'Hatari ya Mafuriko',
    heatwave: 'Joto Kali',
    biodiversity: 'Mazingira',
    chatPlaceholder: 'Uliza kuhusu hatari za mazingira eneo lako...',
    chatTitle: 'Msaidizi wa EcoSentinel AI',
    mapTitle: 'Ramani ya Ufuatiliaji wa Mazingira',
    liveData: 'Data za Moja kwa Moja',
    aqiTitle: 'Kiwango cha Ubora wa Hewa',
    floodTitle: 'Kiwango cha Hatari ya Mafuriko',
    heatIndex: 'Kiwango cha Joto',
    forestCover: 'Mlolongo wa Misitu',
    waterQuality: 'Ubora wa Maji',
    activeAlerts: 'Maonyo Yanayoendelea'
  }
};

let currentLanguage = 'en';

function switchLanguage(lang) {
  currentLanguage = lang;
}

function translate(key) {
  return translations[currentLanguage][key] || key;
}

export { switchLanguage, translate };