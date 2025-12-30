// src/analysis/engines/context.ts

import { BaseEngine, Signal, Metric } from '../baseEngine';

type HistoryItem = {
  date: string;
  state: string;
  explanation: string;
};

export class TimeOfDayEngine extends BaseEngine {
  constructor() {
    super('timeOfDay', 'Heure de la journée', 'Évalue l’heure actuelle pour contextualiser les comportements.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    const hour = new Date().getHours();
    const hourRatio = hour / 24;
    this.addMetric('hourOfDay', hourRatio, 'ratio', 1);
    this.log('Processed time of day');
    return Promise.resolve(this.getMetrics());
  }
}

export class SessionDurationEngine extends BaseEngine {
  private startTime: number;

  constructor(startTime: number) {
    super('sessionDuration', 'Durée de la session', 'Mesure le temps écoulé depuis le début de la session.');
    this.startTime = startTime;
  }

  async process(signal: Signal): Promise<Metric[]> {
    const duration = (Date.now() - this.startTime) / 1000 / 60; // minutes
    this.addMetric('sessionDuration', duration, 'minutes', 1);
    this.log('Processed session duration');
    return Promise.resolve(this.getMetrics());
  }
}

export class RecentHistoryEngine extends BaseEngine {
  constructor() {
    super('recentHistory', 'Historique récent', 'Analyse les analyses passées récentes.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    const stored = localStorage.getItem('canisense_history');
    if (stored) {
      const history: HistoryItem[] = JSON.parse(stored);
      const recent = history.slice(-5);
      const avgStress = recent.reduce((sum: number, item: HistoryItem) => sum + (item.state === 'Stressé' ? 1 : 0), 0) / recent.length;
      this.addMetric('averageRecentStress', avgStress, 'ratio', 0.8);
    } else {
      this.addMetric('averageRecentStress', 0, 'ratio', 0.8);
    }
    this.log('Processed recent history');
    return Promise.resolve(this.getMetrics());
  }
}

export class BaselineEngine extends BaseEngine {
  constructor() {
    super('baseline', 'Baseline individuelle', 'Compare aux comportements de base du chien.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    // Simulate baseline from profile or history
    const profile = JSON.parse(localStorage.getItem('canisense_profil') || '{}');
    const energy = profile.energy || 5;
    const baselineActivation = energy / 10; // normalize
    this.addMetric('baselineActivation', baselineActivation, 'ratio', 0.7);
    this.log('Processed baseline');
    return Promise.resolve(this.getMetrics());
  }
}
