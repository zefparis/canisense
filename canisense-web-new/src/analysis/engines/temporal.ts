// src/analysis/engines/temporal.ts

import { BaseEngine, Signal, Metric } from '../baseEngine';

export class TemporalVariationEngine extends BaseEngine {
  private previousValues: Map<string, number> = new Map();

  constructor() {
    super('temporalVariation', 'Variation temporelle', 'Analyse les variations des signaux dans le temps.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    // This engine might process aggregated metrics, but for simulation, simulate variations
    const t = Date.now() / 1000;
    const currentValue = Math.sin(t) * 0.5 + 0.5;
    const previousValue = this.previousValues.get('variation') || 0;
    const variation = Math.abs(currentValue - previousValue);
    this.previousValues.set('variation', currentValue);
    this.addMetric('signalVariation', variation, 'delta', 0.8);
    this.log('Processed temporal variation');
    return Promise.resolve(this.getMetrics());
  }
}

export class AccumulationEngine extends BaseEngine {
  private accumulatedStress = 0;
  private alpha = 0.1; // EMA alpha

  constructor() {
    super('accumulation', 'Accumulation', 'Accumule le stress ou l’excitation au fil du temps.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    // Simulate accumulation
    const t = Date.now() / 1000;
    const newStress = Math.random() * 0.1;
    this.accumulatedStress = this.alpha * newStress + (1 - this.alpha) * this.accumulatedStress;
    this.addMetric('accumulatedStress', this.accumulatedStress, 'level', 0.9);
    this.log('Processed accumulation');
    return Promise.resolve(this.getMetrics());
  }
}

export class RecoveryEngine extends BaseEngine {
  private recoveryLevel = 1;

  constructor() {
    super('recovery', 'Récupération', 'Mesure la récupération après des périodes d’activité.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    // Simulate recovery
    const t = Date.now() / 1000;
    if (Math.random() < 0.1) {
      this.recoveryLevel = Math.min(1, this.recoveryLevel + 0.1);
    } else {
      this.recoveryLevel = Math.max(0, this.recoveryLevel - 0.01);
    }
    this.addMetric('recoveryLevel', this.recoveryLevel, 'ratio', 0.7);
    this.log('Processed recovery');
    return Promise.resolve(this.getMetrics());
  }
}

export class TransitionEngine extends BaseEngine {
  private previousState = 0;

  constructor() {
    super('transition', 'Transitions', 'Détecte les transitions rapides vs progressives.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    const t = Date.now() / 1000;
    const currentState = Math.sin(t) > 0 ? 1 : 0;
    const transition = currentState !== this.previousState ? 1 : 0;
    this.previousState = currentState;
    this.addMetric('rapidTransition', transition, 'boolean', 0.8);
    this.log('Processed transition');
    return Promise.resolve(this.getMetrics());
  }
}
