// src/lib/models/loadPoseModel.ts

import { PoseResults } from '../../analysis/types';

export async function loadPoseModel() {
  const { Pose } = await import('@mediapipe/pose');
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  await pose.initialize();
  return pose;
}
