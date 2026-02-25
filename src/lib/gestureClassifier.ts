import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface GestureResult {
  name: string;
  emoji: string;
  category: string;
}

/**
 * Advanced rule-based gesture classifier
 * Uses spatial relationships between landmarks to determine hand poses
 */
export function classifyGesture(landmarks: NormalizedLandmark[]): GestureResult | null {
  if (!landmarks || landmarks.length < 21) return null;

  // 1. Calculate basic finger states
  // We check if the tip is further from the wrist than the PIP/MCP joints
  const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const wrist = landmarks[0];
  
  // Finger Tip Indices: Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
  // Finger PIP Indices: Thumb(2), Index(6), Middle(10), Ring(14), Pinky(18)
  
  const isExtended = (tip: number, mid: number, base: number) => {
    const tipToWrist = getDistance(landmarks[tip], wrist);
    const midToWrist = getDistance(landmarks[mid], wrist);
    const baseToWrist = getDistance(landmarks[base], wrist);
    // Tip must be significantly further from wrist than mid and base joints
    return tipToWrist > midToWrist && midToWrist > baseToWrist;
  };

  const indexExtended = isExtended(8, 6, 5);
  const middleExtended = isExtended(12, 10, 9);
  const ringExtended = isExtended(16, 14, 13);
  const pinkyExtended = isExtended(20, 18, 17);

  // Thumb is special - check distance from index base
  const thumbTip = landmarks[4];
  const indexBase = landmarks[5];
  const thumbExtended = getDistance(thumbTip, indexBase) > 0.15;

  // 2. Determine Hand Orientation
  // Simple heuristic for right hand
  const isPalmFacing = landmarks[5].x < landmarks[17].x; 

  // 3. Gesture Logic
  
  // --- NUMBERS & ALPHABET ---
  
  // One / D / I / L / P / X / Z
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (landmarks[8].y < landmarks[6].y - 0.1) {
      return { name: "D / I / L / One", emoji: "☝️", category: "alphabet" };
    }
  }
  
  // Two / Peace / H / K / R / U / V
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "H / K / R / U / V / Two", emoji: "✌️", category: "alphabet" };
  }
  
  // Three
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Three", emoji: "3️⃣", category: "number" };
  }
  
  // Four
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    return { name: "Four", emoji: "4️⃣", category: "number" };
  }
  
  // Five / Hello / B / M / N / W
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    const distMiddleRing = getDistance(landmarks[12], landmarks[16]);
    if (distMiddleRing < 0.08) { // Not Spock
      return { name: "B / M / N / W / Hello", emoji: "✋", category: "alphabet" };
    }
  }

  // --- RESPONSES & ALPHABET ---

  // Thumbs Up / Down
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (landmarks[4].y < landmarks[3].y) {
      return { name: "Thumbs Up / YES", emoji: "👍", category: "response" };
    }
    if (landmarks[4].y > landmarks[3].y) {
      return { name: "Thumbs Down / NO", emoji: "👎", category: "response" };
    }
  }

  // OK / A / F / O
  const distThumbIndex = getDistance(landmarks[4], landmarks[8]);
  if (distThumbIndex < 0.04 && middleExtended && ringExtended && pinkyExtended) {
    return { name: "A / F / O / OK", emoji: "👌", category: "alphabet" };
  }

  // Fist / E / S / T
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "E / S / T / Fist", emoji: "✊", category: "alphabet" };
  }

  // Pinch / C / G / Q
  if (distThumbIndex < 0.06 && !middleExtended && !ringExtended && !pinkyExtended) {
    return { name: "C / G / Q", emoji: "🤏", category: "alphabet" };
  }

  // --- EXPRESSIONS ---

  // I Love You
  if (thumbExtended && indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return { name: "I Love You", emoji: "🤟", category: "expression" };
  }

  // Rock On
  if (!thumbExtended && indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return { name: "Rock On", emoji: "🤘", category: "expression" };
  }

  // Call Me / J / Y
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return { name: "J / Y / Call Me", emoji: "🤙", category: "alphabet" };
  }

  // Pointing
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (landmarks[8].y < landmarks[6].y - 0.1) return { name: "Point Up", emoji: "☝️", category: "direction" };
    if (landmarks[8].x > landmarks[6].x + 0.1) return { name: "Point Right", emoji: "👉", category: "direction" };
    if (landmarks[8].x < landmarks[6].x - 0.1) return { name: "Point Left", emoji: "👈", category: "direction" };
  }

  // Spock / Vulcan Salute
  const distMiddleRing = getDistance(landmarks[12], landmarks[16]);
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended && distMiddleRing > 0.08) {
    return { name: "Vulcan Salute", emoji: "🖖", category: "expression" };
  }

  return null;
}
