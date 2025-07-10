// This file manages language toggling and localization for the dashboard.

const languages = {
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

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    // Update text content
    const texts = languages[lang];
    document.querySelector('.nav-item:nth-child(1) span:last-child').textContent = texts.dashboard;
    document.querySelector('.nav-item:nth-child(2) span:last-child').textContent = texts.airQuality;
    document.querySelector('.nav-item:nth-child(3) span:last-child').textContent = texts.floodRisk;
    document.querySelector('.nav-item:nth-child(4) span:last-child').textContent = texts.heatwave;
    document.querySelector('.nav-item:nth-child(5) span:last-child').textContent = texts.biodiversity;

    document.getElementById('chatInput').placeholder = texts.chatPlaceholder;
    document.querySelector('.chat-title').textContent = texts.chatTitle;
    document.querySelector('.map-title').innerHTML = `<i class="fas fa-map-marked-alt"></i> ${texts.mapTitle}`;
}

// Event listeners for language buttons
document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
document.getElementById('lang-sw').addEventListener('click', () => switchLanguage('sw'));