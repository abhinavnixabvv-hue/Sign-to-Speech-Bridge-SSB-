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

  const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];
  
  // Dynamic Hand Scale: Use distance from wrist to middle finger base
  // This makes the classifier distance-independent (robust to hand being far/near)
  const handSize = getDistance(wrist, middleMCP);
  if (handSize < 0.01) return null; // Prevent division by zero

  const isExtended = (tip: number, pip: number, mcp: number) => {
    const tipToWrist = getDistance(landmarks[tip], wrist);
    const pipToWrist = getDistance(landmarks[pip], wrist);
    const mcpToWrist = getDistance(landmarks[mcp], wrist);
    return tipToWrist > pipToWrist && pipToWrist > mcpToWrist;
  };

  const indexExtended = isExtended(8, 6, 5);
  const middleExtended = isExtended(12, 10, 9);
  const ringExtended = isExtended(16, 14, 13);
  const pinkyExtended = isExtended(20, 18, 17);

  // Normalized Thumb state
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const thumbMCP = landmarks[2];
  
  const thumbExtended = getDistance(thumbTip, indexMCP) / handSize > 0.8;
  const thumbUp = thumbTip.y < thumbIP.y && thumbIP.y < thumbMCP.y;
  const thumbDown = thumbTip.y > thumbIP.y && thumbIP.y > thumbMCP.y;

  // Hand Orientation
  const isHorizontal = Math.abs(landmarks[8].x - landmarks[5].x) > Math.abs(landmarks[8].y - landmarks[5].y);
  const isPointingDown = landmarks[8].y > landmarks[5].y + (handSize * 0.2);

  // --- ALPHABET (ASL Specific) ---
  
  // A: Fist, thumb on side
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && thumbUp) {
    return { name: "A", emoji: "✊", category: "alphabet" };
  }

  // B: Open hand, fingers together
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    const distIndexMiddle = getDistance(landmarks[8], landmarks[12]) / handSize;
    if (distIndexMiddle < 0.3) return { name: "B", emoji: "✋", category: "alphabet" };
  }

  // C: Claw / Curved
  const distThumbIndex = getDistance(thumbTip, landmarks[8]) / handSize;
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbDown) {
    if (distThumbIndex > 0.6 && thumbTip.x < landmarks[8].x) {
       return { name: "C", emoji: "🤏", category: "alphabet" };
    }
  }

  // D: Index up, others touch thumb
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const distThumbMiddle = getDistance(thumbTip, landmarks[12]) / handSize;
    if (distThumbMiddle < 0.3) return { name: "D", emoji: "☝️", category: "alphabet" };
  }

  // E: Fist, fingers curled over thumb
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (thumbTip.y > landmarks[8].y && thumbTip.y > landmarks[12].y) {
      return { name: "E", emoji: "✊", category: "alphabet" };
    }
  }

  // F: OK sign
  if (!indexExtended && middleExtended && ringExtended && pinkyExtended) {
    if (distThumbIndex < 0.2) return { name: "F", emoji: "👌", category: "alphabet" };
  }

  // G: Index and thumb forward
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && isHorizontal) {
    return { name: "G", emoji: "🤏", category: "alphabet" };
  }

  // H: Index and middle forward
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && isHorizontal) {
    return { name: "H", emoji: "✌️", category: "alphabet" };
  }

  // I: Pinky up
  if (!indexExtended && !middleExtended && !ringExtended && pinkyExtended && !thumbExtended) {
    return { name: "I", emoji: "☝️", category: "alphabet" };
  }

  // K: Index and middle up, thumb touches middle
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && thumbExtended) {
    const distThumbMiddleJoint = getDistance(thumbTip, landmarks[10]) / handSize;
    if (distThumbMiddleJoint < 0.3) return { name: "K", emoji: "✌️", category: "alphabet" };
  }

  // L: L shape
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && !isHorizontal) {
    return { name: "L", emoji: "☝️", category: "alphabet" };
  }

  // M: Thumb under 3 fingers
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (thumbTip.x > ringMCP.x) return { name: "M", emoji: "✊", category: "alphabet" };
  }

  // N: Thumb under 2 fingers
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (thumbTip.x > middleMCP.x && thumbTip.x < ringMCP.x) return { name: "N", emoji: "✊", category: "alphabet" };
  }

  // O: Circle
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (distThumbIndex < 0.3) return { name: "O", emoji: "👌", category: "alphabet" };
  }

  // P: Like K but down
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && isPointingDown) {
    return { name: "P", emoji: "✌️", category: "alphabet" };
  }

  // Q: Like G but down
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && isPointingDown) {
    return { name: "Q", emoji: "🤏", category: "alphabet" };
  }

  // R: Index and middle crossed
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    const distTips = getDistance(landmarks[8], landmarks[12]) / handSize;
    if (distTips < 0.15) return { name: "R", emoji: "🤞", category: "alphabet" };
  }

  // S: Fist, thumb over fingers
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (thumbTip.y < indexMCP.y && thumbTip.x > indexMCP.x && thumbTip.x < ringMCP.x) {
      return { name: "S", emoji: "✊", category: "alphabet" };
    }
  }

  // T: Thumb under index
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (thumbTip.x > indexMCP.x && thumbTip.x < middleMCP.x) {
      return { name: "T", emoji: "✊", category: "alphabet" };
    }
  }

  // U: Index and middle up and together
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    const distTips = getDistance(landmarks[8], landmarks[12]) / handSize;
    if (distTips < 0.2) return { name: "U", emoji: "✌️", category: "alphabet" };
  }

  // V: Index and middle up and apart
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    const distTips = getDistance(landmarks[8], landmarks[12]) / handSize;
    if (distTips > 0.3) return { name: "V", emoji: "✌️", category: "alphabet" };
  }

  // W: Index, middle, ring up
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    return { name: "W", emoji: "✋", category: "alphabet" };
  }

  // X: Index hooked
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (landmarks[8].y > landmarks[6].y && landmarks[8].y < indexMCP.y) {
      return { name: "X", emoji: "☝️", category: "alphabet" };
    }
  }

  // Y: Thumb and pinky extended
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return { name: "Y", emoji: "🤙", category: "alphabet" };
  }

  // --- RESPONSES & NUMBERS ---

  // HELP: Based on provided landmark data (Thumb up, Middle up, others curled)
  if (thumbExtended && thumbUp && middleExtended && !indexExtended && !ringExtended && !pinkyExtended) {
    return { name: "HELP", emoji: "🆘", category: "emergency" };
  }

  // HELLO: All fingers extended (Open hand)
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    return { name: "HELLO", emoji: "👋", category: "greeting" };
  }

  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (thumbUp) return { name: "Thumbs Up / YES", emoji: "👍", category: "response" };
    if (thumbDown) return { name: "Thumbs Down / NO", emoji: "👎", category: "response" };
  }

  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "One", emoji: "☝️", category: "number" };
  }

  return null;
}
