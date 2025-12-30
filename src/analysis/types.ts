// src/analysis/types.ts

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  reliability?: number; // 0-1
}

export interface VideoSignalData {
  imageData: ImageData;
  width: number;
  height: number;
}

export interface AudioSignalData {
  buffer: AudioBuffer;
  sampleRate: number;
}

export interface Signal {
  type: 'video' | 'audio' | 'context';
  data: VideoSignalData | AudioSignalData | any; // context is any for now
  timestamp: number;
}

export interface Engine {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  process(signal: Signal): Promise<Metric[]>;
  getMetrics(): Metric[];
  reset(): void;
}

export interface LatentState {
  activation: number; // 0-1
  tension: number; // 0-1
  vigilance: number; // 0-1
  fatigue: number; // 0-1
}

export interface FusionResult {
  latentState: LatentState;
  confidence: number; // 0-1
  dominantSignals: Metric[];
}

export type SyntheticState = 'Calme' | 'Excité' | 'Stressé' | 'Mixte';

export interface UserInterpretation {
  syntheticState: SyntheticState;
  confidence: number;
  explanation: string;
  metrics: Metric[];
}

export interface AnalysisConfig {
  enableDebug: boolean;
  activeEngines: string[];
  fusionWeights: Record<string, number>;
}

export interface UserFeedback {
  analysisId: string;
  timestamp: number;
  correct: boolean;
  comment?: string;
}

// Model interfaces
export interface PoseResults {
  poseLandmarks?: any[]; // MediaPipe pose landmarks
  // Add more as needed
}

export interface SpeechCommandResult {
  scores: number[]; // probabilities for each class
  spectrogram?: any;
}
