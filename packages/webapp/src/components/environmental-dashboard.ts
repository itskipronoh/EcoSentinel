import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { languageManager, type EnvironmentalTranslations } from '../language-config.js';

export interface EnvironmentalStatus {
  id: string;
  title: string;
  value: string;
  location: string;
  level: 'success' | 'warning' | 'danger' | 'info';
  icon?: string;
  lastUpdated?: Date;
}

/**
 * Environmental Dashboard Component for EcoSentinel AI
 * Displays real-time environmental status cards with multilingual support
 * 
 * @element eco-dashboard
 * @fires status-card-click - Fired when a status card is clicked
 */
@customElement('eco-dashboard')
export class EnvironmentalDashboard extends LitElement {
  @property({ type: Array }) 
  statuses: EnvironmentalStatus[] = [
    {
      id: 'flood-risk',
      title: 'Flood Risk',
      value: 'Medium',
      location: 'Kibera, Nairobi',
      level: 'warning',
      icon: '🌊'
    },
    {
      id: 'air-quality',
      title: 'Air Quality',
      value: '156 AQI',
      location: 'Industrial Area',
      level: 'danger',
      icon: '💨'
    },
    {
      id: 'forest-cover',
      title: 'Forest Cover',
      value: 'Stable',
      location: 'Aberdare Range',
      level: 'success',
      icon: '🌳'
    },
    {
      id: 'heat-index',
      title: 'Heat Index',
      value: '28°C',
      location: 'Kisumu County',
      level: 'info',
      icon: '🌡️'
    }
  ];

  @state() 
  private currentLanguage = languageManager.getCurrentLanguage();

  connectedCallback() {
    super.connectedCallback();
    this.startRealtimeUpdates();
    
    // Listen for language changes
    document.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('languageChanged', this.handleLanguageChange.bind(this));
  }

  private handleLanguageChange(event: CustomEvent) {
    this.currentLanguage = event.detail.language;
    this.requestUpdate();
  }

  private handleStatusCardClick(status: EnvironmentalStatus) {
    const event = new CustomEvent('status-card-click', {
      detail: { status },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private startRealtimeUpdates() {
    // Simulate real-time environmental data updates
    setInterval(() => {
      this.updateEnvironmentalData();
    }, 30000); // Update every 30 seconds
  }

  private updateEnvironmentalData() {
    const riskLevels = ['Low', 'Medium', 'High'];
    const locations = ['Kibera', 'Kawangware', 'Mathare', 'Korogocho'];
    
    // Update flood risk randomly
    const floodStatus = this.statuses.find(s => s.id === 'flood-risk');
    if (floodStatus) {
      const newRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const newLocation = locations[Math.floor(Math.random() * locations.length)];
      
      floodStatus.value = newRisk;
      floodStatus.location = `${newLocation}, Nairobi`;
      floodStatus.level = newRisk === 'High' ? 'danger' : newRisk === 'Medium' ? 'warning' : 'success';
      floodStatus.lastUpdated = new Date();
      
      this.requestUpdate();
    }

    // Update air quality
    const airStatus = this.statuses.find(s => s.id === 'air-quality');
    if (airStatus) {
      const newAQI = Math.floor(Math.random() * 200) + 50; // 50-250 AQI
      airStatus.value = `${newAQI} AQI`;
      airStatus.level = newAQI > 150 ? 'danger' : newAQI > 100 ? 'warning' : 'success';
      airStatus.lastUpdated = new Date();
      
      this.requestUpdate();
    }
  }

  private translateValue(value: string): string {
    // Translate common values
    const translations: Record<string, Record<string, string>> = {
      en: {
        'Low': 'Low',
        'Medium': 'Medium', 
        'High': 'High',
        'Stable': 'Stable'
      },
      sw: {
        'Low': 'Chini',
        'Medium': 'Wastani',
        'High': 'Juu', 
        'Stable': 'Thabiti'
      }
    };

    return translations[this.currentLanguage]?.[value] || value;
  }

  private renderStatusCard(status: EnvironmentalStatus) {
    const translatedTitle = languageManager.translate(status.title);
    const translatedValue = this.translateValue(status.value);
    
    return html`
      <div 
        class="status-card ${status.level}" 
        @click=${() => this.handleStatusCardClick(status)}
        role="button"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleStatusCardClick(status);
          }
        }}
      >
        <div class="status-icon">${status.icon}</div>
        <div class="status-content">
          <div class="status-title">${translatedTitle}</div>
          <div class="status-value">${translatedValue}</div>
          <div class="status-location">${status.location}</div>
          ${status.lastUpdated ? html`
            <div class="status-updated">
              ${this.currentLanguage === 'sw' ? 'Imesasishwa' : 'Updated'}: 
              ${status.lastUpdated.toLocaleTimeString()}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  protected render() {
    return html`
      <div class="dashboard-grid">
        ${this.statuses.map(status => this.renderStatusCard(status))}
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: 20px;
      background: var(--eco-bg-tertiary, #F5F5F5);
      border-bottom: 1px solid var(--eco-border, #E0E0E0);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .status-card {
      background: var(--eco-surface, #FFFFFF);
      border-radius: var(--eco-border-radius, 12px);
      padding: 20px;
      box-shadow: var(--eco-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      border-left: 4px solid transparent;
    }

    .status-card:hover {
      box-shadow: var(--eco-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
      transform: translateY(-2px);
    }

    .status-card:focus {
      outline: 2px solid var(--eco-primary, #40A957);
      outline-offset: 2px;
    }

    .status-card.danger { 
      border-left-color: var(--eco-danger, #F44336);
    }
    
    .status-card.warning { 
      border-left-color: var(--eco-warning, #FF9800);
    }
    
    .status-card.success { 
      border-left-color: var(--eco-success, #4CAF50);
    }
    
    .status-card.info { 
      border-left-color: var(--eco-info, #2196F3);
    }

    .status-icon {
      font-size: 2rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .status-content {
      flex: 1;
      min-width: 0;
    }

    .status-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--eco-text-secondary, #666666);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--eco-text-primary, #1B1B1B);
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .status-location {
      font-size: 0.8rem;
      color: var(--eco-text-tertiary, #999999);
      margin-bottom: 8px;
    }

    .status-updated {
      font-size: 0.75rem;
      color: var(--eco-text-tertiary, #999999);
      font-style: italic;
    }

    @media (max-width: 768px) {
      :host {
        padding: 16px;
      }
      
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      
      .status-card {
        padding: 16px;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
      }
      
      .status-icon {
        font-size: 1.5rem;
      }
      
      .status-value {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'eco-dashboard': EnvironmentalDashboard;
  }
}
