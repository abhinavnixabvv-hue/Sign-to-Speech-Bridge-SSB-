import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * Simple exponential smoothing for landmarks
 * formula: smoothed = alpha * current + (1 - alpha) * previous
 */
export function smoothLandmarks(
  current: NormalizedLandmark[],
  previous: NormalizedLandmark[] | null,
  alpha: number = 0.5
): NormalizedLandmark[] {
  if (!previous || previous.length !== current.length) {
    return current;
  }

  return current.map((landmark, i) => ({
    ...landmark,
    x: alpha * landmark.x + (1 - alpha) * previous[i].x,
    y: alpha * landmark.y + (1 - alpha) * previous[i].y,
    z: alpha * landmark.z + (1 - alpha) * previous[i].z,
  }));
}

/**
 * Moving average smoothing for landmarks
 */
export class LandmarkSmoother {
  private history: NormalizedLandmark[][] = [];
  private windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  add(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    this.history.push(landmarks);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    if (this.history.length === 1) {
      return landmarks;
    }

    // Weighted Moving Average: more recent frames have higher weight
    // Weights: [1, 2, 3, 4, 5] for windowSize 5
    const smoothed: NormalizedLandmark[] = [];
    const numPoints = landmarks.length;
    const totalWeight = (this.history.length * (this.history.length + 1)) / 2;

    for (let i = 0; i < numPoints; i++) {
      let weightedSumX = 0;
      let weightedSumY = 0;
      let weightedSumZ = 0;

      for (let j = 0; j < this.history.length; j++) {
        const weight = j + 1; // Linear weight
        weightedSumX += this.history[j][i].x * weight;
        weightedSumY += this.history[j][i].y * weight;
        weightedSumZ += this.history[j][i].z * weight;
      }

      smoothed.push({
        ...landmarks[i],
        x: weightedSumX / totalWeight,
        y: weightedSumY / totalWeight,
        z: weightedSumZ / totalWeight,
      });
    }

    return smoothed;
  }

  clear() {
    this.history = [];
  }
}
