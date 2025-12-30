// src/analysis/engines/audio.ts

import { BaseEngine, Signal, Metric } from '../baseEngine';

export class SoundActivityEngine extends BaseEngine {
  constructor() {
    super('soundActivity', 'Activité sonore', 'Analyse volume moyen, pics, silence prolongé.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'audio') return Promise.resolve([]);
    // Real: compute RMS from buffer
    const buffer = signal.data.buffer;
    const channelData = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sum / channelData.length);
    const averageVolume = rms * 100; // scale to dB-like
    const peaks = Math.max(...channelData.map(Math.abs)) * 120; // max amplitude
    const prolongedSilence = rms < 0.01 ? 1 : 0;
    this.addMetric('averageVolume', averageVolume, 'dB', 0.8);
    this.addMetric('peaks', peaks, 'dB', 0.9);
    this.addMetric('prolongedSilence', prolongedSilence, 'boolean', 0.7);
    this.log('Processed sound activity');
    return Promise.resolve(this.getMetrics());
  }
}

export class VocalSignatureEngine extends BaseEngine {
  constructor() {
    super('vocalSignature', 'Signature vocale', 'Analyse aboiement, gémissement, grognement, souffle.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'audio') return Promise.resolve([]);
    // Simulate for now
    const t = Date.now() / 1000;
    this.addMetric('barking', Math.random(), 'probability', 0.8);
    this.addMetric('whining', Math.random(), 'probability', 0.7);
    this.addMetric('growling', Math.random(), 'probability', 0.9);
    this.addMetric('panting', Math.random(), 'probability', 0.6);
    this.log('Processed vocal signature');
    return Promise.resolve(this.getMetrics());
  }
}

export class RhythmEngine extends BaseEngine {
  constructor() {
    super('rhythm', 'Rythme', 'Analyse répétition, irrégularité, bursts.');
  }

  async process(signal: Signal): Promise<Metric[]> {
    if (signal.type !== 'audio') return Promise.resolve([]);
    // Simulate
    const t = Date.now() / 1000;
    this.addMetric('repetition', Math.random(), 'ratio', 0.8);
    this.addMetric('irregularity', Math.random(), 'ratio', 0.7);
    this.addMetric('bursts', Math.random() < 0.5 ? 1 : 0, 'boolean', 0.9);
    this.log('Processed rhythm');
    return Promise.resolve(this.getMetrics());
  }
}
