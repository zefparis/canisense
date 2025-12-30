// src/analysis/engines/visual.ts

import { BaseEngine, Signal, Metric } from '../baseEngine';
import { loadPoseModel } from '../../lib/models/loadPoseModel';
import { Pose } from '@mediapipe/pose';

export class GlobalMovementEngine extends BaseEngine {
  constructor() {
    super('globalMovement', 'Mouvement global', 'Analyse la vitesse moyenne, accélérations, agitation, immobilité prolongée.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'video') return [];
    // Simulate metrics
    const t = Date.now() / 1000;
    this.addMetric('averageSpeed', Math.abs(Math.sin(t)) * 10, 'm/s', 0.8);
    this.addMetric('accelerations', Math.random() * 5, 'm/s²', 0.7);
    this.addMetric('agitation', Math.random(), 'ratio', 0.9);
    this.addMetric('prolongedImmobility', Math.random() < 0.3 ? 1 : 0, 'boolean', 0.6);
    this.log('Processed global movement');
    return Promise.resolve(this.getMetrics());
  }
}

export class BodyPostureEngine extends BaseEngine {
  private pose: Pose | null = null;

  constructor() {
    super('bodyPosture', 'Posture corporelle', 'Analyse hauteur du corps, orientation générale, rigidité vs relâchement avec MediaPipe Pose.');
    loadPoseModel().then(p => {
      this.pose = p;
      this.log('Pose model loaded');
    }).catch(err => this.log(`Failed to load pose model: ${err}`));
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'video' || !this.pose) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      this.pose!.onResults((results) => {
        const metrics = this.extractMetrics(results, signal.data);
        resolve(metrics);
      });
      this.pose!.send(signal.data.imageData);
    });
  }

  private extractMetrics(results: any, videoData: any): Metric[] {
    const landmarks = results.poseLandmarks;
    if (!landmarks || landmarks.length === 0) {
      return [];
    }

    // Body height: normalized distance from nose (0) to ankles average
    const nose = landmarks[0];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const bodyHeight = Math.abs(nose.y - ankleY); // normalized 0-1

    // General orientation: angle of shoulders (11 and 12)
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const orientation = Math.atan2(dy, dx) * 180 / Math.PI; // degrees

    // Rigidity: variance of landmark positions (simplified)
    const positions = landmarks.map((l: any) => [l.x, l.y]).flat();
    const mean = positions.reduce((a: number, b: number) => a + b, 0) / positions.length;
    const variance = positions.reduce((sum: number, val: number) => sum + (val - mean) ** 2, 0) / positions.length;
    const rigidity = Math.min(variance * 1000, 1); // scale to 0-1

    this.addMetric('bodyHeight', bodyHeight, 'ratio', 0.8);
    this.addMetric('generalOrientation', (orientation + 180) / 360, 'ratio', 0.7); // 0-1
    this.addMetric('rigidity', rigidity, 'ratio', 0.9);

    this.log('Extracted posture metrics');
    return this.getMetrics();
  }
}

export class TailEngine extends BaseEngine {
  constructor() {
    super('tail', 'Queue', 'Analyse fréquence de battement, amplitude, direction, asymétrie.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'video') return Promise.resolve([]);
    const t = Date.now() / 1000;
    this.addMetric('wagFrequency', Math.abs(Math.sin(t)) * 5, 'Hz', 0.8);
    this.addMetric('amplitude', Math.random() * 90, 'degrees', 0.7);
    this.addMetric('direction', Math.random() * 180 - 90, 'degrees', 0.9); // -90 to 90
    this.addMetric('asymmetry', Math.random() * 0.5, 'ratio', 0.6);
    this.log('Processed tail');
    return Promise.resolve(this.getMetrics());
  }
}

export class EarsEngine extends BaseEngine {
  constructor() {
    super('ears', 'Oreilles', 'Analyse position, micro-mouvements, variations rapides.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'video') return Promise.resolve([]);
    const t = Date.now() / 1000;
    this.addMetric('position', Math.random() < 0.5 ? 1 : 0, 'up/flat', 0.8); // 1=up, 0=flat
    this.addMetric('microMovements', Math.random(), 'intensity', 0.7);
    this.addMetric('rapidVariations', Math.random() < 0.2 ? 1 : 0, 'boolean', 0.9);
    this.log('Processed ears');
    return Promise.resolve(this.getMetrics());
  }
}

export class HeadGazeEngine extends BaseEngine {
  constructor() {
    super('headGaze', 'Tête et regard', 'Analyse orientation, stabilité, mouvements brusques.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'video') return Promise.resolve([]);
    const t = Date.now() / 1000;
    this.addMetric('orientation', Math.random() * 360, 'degrees', 0.8);
    this.addMetric('stability', 1 - Math.random() * 0.5, 'ratio', 0.7);
    this.addMetric('suddenMovements', Math.random() < 0.3 ? 1 : 0, 'boolean', 0.9);
    this.log('Processed head and gaze');
    return Promise.resolve(this.getMetrics());
  }
}
