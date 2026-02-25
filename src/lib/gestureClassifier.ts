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
  
  // --- NUMBERS ---
  
  // One
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "One", emoji: "1️⃣", category: "number" };
  }
  
  // Two / Peace
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Two", emoji: "2️⃣", category: "number" };
  }
  
  // Three
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Three", emoji: "3️⃣", category: "number" };
  }
  
  // Four
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    return { name: "Four", emoji: "4️⃣", category: "number" };
  }
  
  // Five / Hello / Stop
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    if (landmarks[8].y < landmarks[0].y) {
       return { name: "Five / Hello", emoji: "👋", category: "greeting" };
    }
  }

  // --- RESPONSES ---

  // Thumbs Up / Down
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (landmarks[4].y < landmarks[3].y) {
      return { name: "Thumbs Up", emoji: "👍", category: "response" };
    }
    if (landmarks[4].y > landmarks[3].y) {
      return { name: "Thumbs Down", emoji: "👎", category: "response" };
    }
  }

  // OK
  const distThumbIndex = getDistance(landmarks[4], landmarks[8]);
  if (distThumbIndex < 0.04 && middleExtended && ringExtended && pinkyExtended) {
    return { name: "OK", emoji: "👌", category: "response" };
  }

  // Fist
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Fist", emoji: "✊", category: "response" };
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

  // Call Me
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return { name: "Call Me", emoji: "🤙", category: "expression" };
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
