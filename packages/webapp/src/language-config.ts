// Language configuration for EcoSentinel AI
// Supports English and Kiswahili for environmental intelligence

export interface LanguageConfig {
  enablePromptSuggestions: boolean;
  promptSuggestions: string[];
  strings: {
    promptSuggestionsTitle: string;
    citationsTitle: string;
    followUpQuestionsTitle: string;
    chatInputPlaceholder: string;
    chatInputButtonLabel: string;
    assistant: string;
    user: string;
    errorMessage: string;
    newChatButton: string;
    retryButton: string;
  };
}

export interface EnvironmentalTranslations {
  [key: string]: string;
}

export const environmentalTranslations: Record<string, EnvironmentalTranslations> = {
  en: {
    // Environmental monitoring terms
    'Flood Risk': 'Flood Risk',
    'Air Quality': 'Air Quality',
    'Forest Cover': 'Forest Cover',
    'Heat Index': 'Heat Index',
    'Deforestation': 'Deforestation',
    'Drought Risk': 'Drought Risk',
    'Soil Erosion': 'Soil Erosion',
    'Water Quality': 'Water Quality',
    
    // Risk levels
    'Low': 'Low',
    'Medium': 'Medium',
    'High': 'High',
    'Critical': 'Critical',
    'Stable': 'Stable',
    'Improving': 'Improving',
    'Deteriorating': 'Deteriorating',
    
    // Status messages
    'Environmental Monitor Active': 'Environmental Monitor Active',
    'Data Updated': 'Data Updated',
    'Alert': 'Alert',
    'Normal': 'Normal',
    
    // Locations
    'Nairobi': 'Nairobi',
    'Kisumu': 'Kisumu',
    'Mombasa': 'Mombasa',
    'Eldoret': 'Eldoret',
    'Nakuru': 'Nakuru',
    'Kibera': 'Kibera',
    'Kawangware': 'Kawangware',
    'Mathare': 'Mathare',
    'Korogocho': 'Korogocho',
  },
  sw: {
    // Environmental monitoring terms  
    'Flood Risk': 'Hatari ya Mafuriko',
    'Air Quality': 'Ubora wa Hewa',
    'Forest Cover': 'Mlolongo wa Misitu',
    'Heat Index': 'Kiwango cha Joto',
    'Deforestation': 'Ukataji Misitu',
    'Drought Risk': 'Hatari ya Ukame',
    'Soil Erosion': 'Mmomonyoko wa Udongo',
    'Water Quality': 'Ubora wa Maji',
    
    // Risk levels
    'Low': 'Chini',
    'Medium': 'Wastani', 
    'High': 'Juu',
    'Critical': 'Hatari Kubwa',
    'Stable': 'Thabiti',
    'Improving': 'Inaboresha',
    'Deteriorating': 'Inaharibu',
    
    // Status messages
    'Environmental Monitor Active': 'Ufuatiliaji wa Mazingira Unaendelea',
    'Data Updated': 'Data Imesasishwa',
    'Alert': 'Onyo',
    'Normal': 'Kawaida',
    
    // Locations (keeping original names but could add local variations)
    'Nairobi': 'Nairobi',
    'Kisumu': 'Kisumu', 
    'Mombasa': 'Mombasa',
    'Eldoret': 'Eldoret',
    'Nakuru': 'Nakuru',
    'Kibera': 'Kibera',
    'Kawangware': 'Kawangware',
    'Mathare': 'Mathare',
    'Korogocho': 'Korogocho',
  }
};

export const languageConfigs: Record<string, LanguageConfig> = {
  en: {
    enablePromptSuggestions: true,
    promptSuggestions: [
      '🌊 What is the flood risk in my area this week?',
      '🌱 When should I plant maize based on weather patterns?',
      '💨 How is the air quality in Nairobi today?',
      '🌳 Are there any deforestation alerts in Central Kenya?',
      '⚠️ What environmental risks should I prepare for?',
      '📍 Give me hyperlocal environmental predictions',
      '🏠 How can my community adapt to climate change?',
      '🚨 What should I do during environmental emergencies?',
      '🌾 What crops are best for this season in my area?',
      '💧 Is the water quality safe in my location?',
    ],
    strings: {
      promptSuggestionsTitle: 'Ask EcoSentinel AI about environmental risks and guidance',
      citationsTitle: 'Environmental Data Sources:',
      followUpQuestionsTitle: 'Related environmental questions:',
      chatInputPlaceholder: 'Ask about environmental risks, weather forecasts, or local guidance...',
      chatInputButtonLabel: 'Send environmental query',
      assistant: 'EcoSentinel AI',
      user: 'You',
      errorMessage: 'Environmental intelligence service is temporarily unavailable. Please try again.',
      newChatButton: 'New environmental query',
      retryButton: 'Retry environmental query',
    },
  },
  sw: {
    enablePromptSuggestions: true,
    promptSuggestions: [
      '🌊 Ni hatari gani ya mafuriko katika eneo langu wiki hii?',
      '🌱 Ni wakati gani bora wa kupanda mahindi kulingana na hali ya hewa?',
      '💨 Je, ubora wa hewa Nairobi ni vipi leo?',
      '🌳 Kuna onyo la ukataji misitu katika Kenya ya Kati?',
      '⚠️ Ni hatari gani za mazingira ninapaswa kujiandalia?',
      '📍 Nipe utabiri wa mazingira wa eneo langu',
      '🏠 Jamii yangu iwezaje kubadilika na mabadiliko ya tabianchi?',
      '🚨 Nifanye nini wakati wa dharura za mazingira?',
      '🌾 Ni mazao gani bora kwa msimu huu eneo langu?',
      '💧 Je, ubora wa maji ni salama eneo langu?',
    ],
    strings: {
      promptSuggestionsTitle: 'Uliza EcoSentinel AI kuhusu hatari za mazingira na mwongozo',
      citationsTitle: 'Vyanzo vya Data ya Mazingira:',
      followUpQuestionsTitle: 'Maswali mengine yanayohusiana:',
      chatInputPlaceholder: 'Uliza kuhusu hatari za mazingira, utabiri wa hali ya hewa, au mwongozo wa eneo lako...',
      chatInputButtonLabel: 'Tuma swali la mazingira',
      assistant: 'EcoSentinel AI',
      user: 'Wewe',
      errorMessage: 'Huduma ya akili ya mazingira haipatikani kwa sasa. Tafadhali jaribu tena.',
      newChatButton: 'Mazungumzo mapya ya mazingira',
      retryButton: 'Jaribu tena swali la mazingira',
    },
  },
};

export class LanguageManager {
  private currentLanguage: string;

  constructor(defaultLanguage: string = 'en') {
    this.currentLanguage = localStorage.getItem('ecoSentinelLanguage') || defaultLanguage;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
    localStorage.setItem('ecoSentinelLanguage', language);
  }

  getConfig(): LanguageConfig {
    return languageConfigs[this.currentLanguage] || languageConfigs.en;
  }

  translate(key: string): string {
    return environmentalTranslations[this.currentLanguage]?.[key] || key;
  }

  getSupportedLanguages(): string[] {
    return Object.keys(languageConfigs);
  }

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      en: 'English',
      sw: 'Kiswahili',
    };
    return names[code] || code;
  }
}

export const languageManager = new LanguageManager();
