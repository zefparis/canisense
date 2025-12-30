// src/lib/models/loadAudioModel.ts

import * as speechCommands from '@tensorflow-models/speech-commands';

export async function loadAudioModel() {
  const recognizer = speechCommands.create("BROWSER_FFT");
  await recognizer.ensureModelLoaded();
  return recognizer;
}
