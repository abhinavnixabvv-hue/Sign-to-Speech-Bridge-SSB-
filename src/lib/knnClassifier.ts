import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface TrainingSample {
  label: string;
  landmarks: number[]; // 63 values
}

export class KNNClassifier {
  private samples: TrainingSample[] = [];

  constructor(initialSamples: TrainingSample[] = []) {
    this.samples = initialSamples;
  }

  addSample(label: string, landmarks: NormalizedLandmark[]) {
    const flattened = landmarks.flatMap(l => [l.x, l.y, l.z]);
    this.samples.push({ label, landmarks: flattened });
  }

  predict(currentLandmarks: NormalizedLandmark[], k: number = 5): { label: string; confidence: number } | null {
    if (this.samples.length === 0) return null;

    const currentFlattened = currentLandmarks.flatMap(l => [l.x, l.y, l.z]);
    
    // Calculate distances to all samples
    const distances = this.samples.map(sample => {
      let dist = 0;
      for (let i = 0; i < 63; i++) {
        dist += Math.pow(currentFlattened[i] - sample.landmarks[i], 2);
      }
      return { label: sample.label, distance: Math.sqrt(dist) };
    });

    // Sort by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Get top K
    const topK = distances.slice(0, k);
    
    // Count votes
    const votes: Record<string, number> = {};
    topK.forEach(d => {
      votes[d.label] = (votes[d.label] || 0) + 1;
    });

    // Find winner
    let winner = '';
    let maxVotes = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = label;
      }
    }

    return {
      label: winner,
      confidence: maxVotes / k
    };
  }
}
