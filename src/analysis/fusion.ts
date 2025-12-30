// src/analysis/fusion.ts

import { Metric, LatentState, FusionResult, UserInterpretation, SyntheticState } from './types';

export function normalizeMetrics(metrics: Metric[]): Metric[] {
  return metrics.map(metric => {
    let normalizedValue = metric.value;
    // Define normalization based on name or unit
    switch (metric.name) {
      case 'averageSpeed':
        normalizedValue = Math.min(metric.value / 10, 1); // 0-10 -> 0-1
        break;
      case 'accelerations':
        normalizedValue = Math.min(metric.value / 5, 1); // 0-5 -> 0-1
        break;
      case 'agitation':
      case 'rigidity':
      case 'asymmetry':
      case 'microMovements':
      case 'stability':
      case 'recoveryLevel':
      case 'signalVariation':
      case 'barking':
      case 'whining':
      case 'growling':
      case 'panting':
      case 'repetition':
      case 'irregularity':
      case 'hourOfDay':
      case 'averageRecentStress':
      case 'baselineActivation':
        normalizedValue = Math.max(0, Math.min(metric.value, 1)); // already 0-1
        break;
      case 'bodyHeight':
        normalizedValue = metric.value; // already 0-1
        break;
      case 'wagFrequency':
        normalizedValue = Math.min(metric.value / 5, 1); // 0-5 -> 0-1
        break;
      case 'amplitude':
        normalizedValue = Math.min(metric.value / 90, 1); // 0-90 -> 0-1
        break;
      case 'direction':
        normalizedValue = Math.abs(metric.value) / 90; // -90-90 -> 0-1
        break;
      case 'position':
      case 'rapidVariations':
      case 'suddenMovements':
      case 'prolongedSilence':
      case 'bursts':
      case 'rapidTransition':
        normalizedValue = metric.value; // 0 or 1
        break;
      case 'generalOrientation':
      case 'orientation':
        normalizedValue = metric.value / 360; // 0-1
        break;
      case 'averageVolume':
        normalizedValue = Math.min(metric.value / 100, 1); // 0-100 -> 0-1
        break;
      case 'peaks':
        normalizedValue = Math.min(metric.value / 120, 1); // 0-120 -> 0-1
        break;
      case 'accumulatedStress':
        normalizedValue = Math.min(metric.value, 1); // cap at 1
        break;
      case 'sessionDuration':
        normalizedValue = Math.min(metric.value / 60, 1); // 0-60 min -> 0-1
        break;
      default:
        normalizedValue = Math.max(0, Math.min(metric.value, 1)); // default
    }
    return { ...metric, value: normalizedValue };
  });
}

export function fuseMetrics(normalizedMetrics: Metric[], weights: Record<string, number> = {}): FusionResult {
  // Group metrics for latent state
  const activationMetrics = normalizedMetrics.filter(m =>
    ['averageSpeed', 'agitation', 'averageVolume', 'peaks', 'wagFrequency', 'amplitude', 'barking', 'panting'].includes(m.name)
  );
  const tensionMetrics = normalizedMetrics.filter(m =>
    ['accelerations', 'rigidity', 'asymmetry', 'growling', 'rapidVariations', 'suddenMovements', 'accumulatedStress'].includes(m.name)
  );
  const vigilanceMetrics = normalizedMetrics.filter(m =>
    ['position', 'microMovements', 'stability', 'orientation'].includes(m.name)
  );
  const fatigueMetrics = normalizedMetrics.filter(m =>
    ['prolongedImmobility', 'recoveryLevel', 'signalVariation', 'sessionDuration'].includes(m.name)
  );

  const activation = activationMetrics.length ? activationMetrics.reduce((sum, m) => sum + m.value * (weights[m.name] || 1), 0) / activationMetrics.length : 0;
  const tension = tensionMetrics.length ? tensionMetrics.reduce((sum, m) => sum + m.value * (weights[m.name] || 1), 0) / tensionMetrics.length : 0;
  const vigilance = vigilanceMetrics.length ? vigilanceMetrics.reduce((sum, m) => sum + m.value * (weights[m.name] || 1), 0) / vigilanceMetrics.length : 0;
  const fatigue = fatigueMetrics.length ? fatigueMetrics.reduce((sum, m) => sum + m.value * (weights[m.name] || 1), 0) / fatigueMetrics.length : 0;

  const latentState: LatentState = { activation, tension, vigilance, fatigue };
  const confidence = normalizedMetrics.reduce((sum, m) => sum + (m.reliability || 1), 0) / normalizedMetrics.length;
  const dominantSignals = normalizedMetrics.sort((a, b) => b.value - a.value).slice(0, 5);

  return { latentState, confidence, dominantSignals };
}

export function interpretLatentState(fusionResult: FusionResult): UserInterpretation {
  const { latentState, confidence, dominantSignals } = fusionResult;
  let syntheticState: SyntheticState = 'Mixte';
  let explanation = 'Comportement mixte observé.';

  if (latentState.activation > 0.7 && latentState.tension > 0.7) {
    syntheticState = 'Excité';
    explanation = 'Le chien montre des signes d’excitation élevés avec agitation et vocalisations.';
  } else if (latentState.tension > 0.8) {
    syntheticState = 'Stressé';
    explanation = 'Signes de tension élevés, possible stress.';
  } else if (latentState.activation < 0.3 && latentState.fatigue > 0.6) {
    syntheticState = 'Calme';
    explanation = 'Comportement calme et détendu observé.';
  }

  // Adjust based on dominant signals
  if (dominantSignals.some(m => m.name === 'growling' && m.value > 0.5)) {
    explanation += ' Grognements détectés.';
  }
  if (dominantSignals.some(m => m.name === 'wagFrequency' && m.value > 0.7)) {
    explanation += ' Battement de queue fréquent.';
  }

  return { syntheticState, confidence, explanation, metrics: dominantSignals };
}
