// src/analysis/pipeline.ts

import { Engine, Signal, Metric, AnalysisConfig, UserInterpretation } from './types';
import { normalizeMetrics, fuseMetrics, interpretLatentState } from './fusion';
// Import all engines
import { GlobalMovementEngine, BodyPostureEngine, TailEngine, EarsEngine, HeadGazeEngine } from './engines/visual';
import { SoundActivityEngine, VocalSignatureEngine, RhythmEngine } from './engines/audio';
import { TemporalVariationEngine, AccumulationEngine, RecoveryEngine, TransitionEngine } from './engines/temporal';
import { TimeOfDayEngine, SessionDurationEngine, RecentHistoryEngine, BaselineEngine } from './engines/context';

export class AnalysisPipeline {
  private engines: Engine[] = [];
  private config: AnalysisConfig;
  private sessionStart: number;

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.sessionStart = Date.now();
    this.initializeEngines();
  }

  private initializeEngines() {
    // Instantiate visual engines
    this.engines.push(new GlobalMovementEngine());
    this.engines.push(new BodyPostureEngine());
    this.engines.push(new TailEngine());
    this.engines.push(new EarsEngine());
    this.engines.push(new HeadGazeEngine());

    // Audio engines
    this.engines.push(new SoundActivityEngine());
    this.engines.push(new VocalSignatureEngine());
    this.engines.push(new RhythmEngine());

    // Temporal engines
    this.engines.push(new TemporalVariationEngine());
    this.engines.push(new AccumulationEngine());
    this.engines.push(new RecoveryEngine());
    this.engines.push(new TransitionEngine());

    // Context engines
    this.engines.push(new TimeOfDayEngine());
    this.engines.push(new SessionDurationEngine(this.sessionStart));
    this.engines.push(new RecentHistoryEngine());
    this.engines.push(new BaselineEngine());

    // Set active based on config
    this.engines.forEach(engine => {
      engine.isActive = this.config.activeEngines.includes(engine.id);
    });
  }

  async processSignal(signal: Signal): Promise<Metric[]> {
    const allMetrics: Metric[] = [];
    for (const engine of this.engines) {
      if (engine.isActive) {
        const metrics = await engine.process(signal);
        allMetrics.push(...metrics);
      }
    }
    return allMetrics;
  }

  getAnalysis(): UserInterpretation {
    const allMetrics = this.engines.flatMap(engine => engine.getMetrics());
    const normalized = normalizeMetrics(allMetrics);
    const fusionResult = fuseMetrics(normalized, this.config.fusionWeights);
    return interpretLatentState(fusionResult);
  }

  reset() {
    this.engines.forEach(engine => engine.reset());
  }

  getActiveEngines(): Engine[] {
    return this.engines.filter(e => e.isActive);
  }

  getAllMetrics(): Metric[] {
    return this.engines.flatMap(engine => engine.getMetrics());
  }
}
