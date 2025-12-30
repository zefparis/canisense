// src/analysis/baseEngine.ts

import { Engine, Metric, Signal } from './types';

export type { Metric, Signal } from './types';

export abstract class BaseEngine implements Engine {
  id: string;
  name: string;
  description: string;
  isActive: boolean = true;
  protected metrics: Metric[] = [];

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  abstract process(signal: Signal): Promise<Metric[]>;

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  reset(): void {
    this.metrics = [];
  }

  protected addMetric(name: string, value: number, unit?: string, reliability: number = 1): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
      reliability
    });
  }

  protected log(message: string): void {
    console.log(`[${this.id}] ${message}`);
  }
}
