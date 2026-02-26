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
  const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const wrist = landmarks[0];
  
  // Finger Tip Indices: Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
  // Finger PIP Indices: Thumb(2), Index(6), Middle(10), Ring(14), Pinky(18)
  // Finger MCP Indices: Thumb(1), Index(5), Middle(9), Ring(13), Pinky(17)
  
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

  // Thumb state
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const thumbMCP = landmarks[2];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];

  const thumbExtended = getDistance(thumbTip, indexMCP) > 0.12;
  const thumbUp = thumbTip.y < thumbIP.y && thumbIP.y < thumbMCP.y;
  const thumbDown = thumbTip.y > thumbIP.y && thumbIP.y > thumbMCP.y;

  // 2. Determine Hand Orientation
  const isHorizontal = Math.abs(landmarks[8].x - landmarks[5].x) > Math.abs(landmarks[8].y - landmarks[5].y);
  const isPointingDown = landmarks[8].y > landmarks[5].y + 0.05;

  // 3. Gesture Logic
  
  // --- ALPHABET (ASL Specific) ---
  
  // A: Fist, thumb on side
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && thumbUp) {
    return { name: "A", emoji: "✊", category: "alphabet" };
  }

  // B: Open hand, fingers together
  const distIndexMiddle = getDistance(landmarks[8], landmarks[12]);
  const distMiddleRing = getDistance(landmarks[12], landmarks[16]);
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    if (distIndexMiddle < 0.05 && distMiddleRing < 0.05) {
      return { name: "B / Hello", emoji: "✋", category: "alphabet" };
    }
  }

  // C: Claw / Curved
  const distThumbIndex = getDistance(landmarks[4], landmarks[8]);
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (distThumbIndex > 0.1 && landmarks[4].x < landmarks[8].x) {
       return { name: "C", emoji: "🤏", category: "alphabet" };
    }
  }

  // D: Index up, others touch thumb
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const distThumbMiddle = getDistance(landmarks[4], landmarks[12]);
    if (distThumbMiddle < 0.05) {
      return { name: "D", emoji: "☝️", category: "alphabet" };
    }
  }

  // E: Fist, fingers curled over thumb
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (landmarks[4].y > landmarks[8].y && landmarks[4].y > landmarks[12].y) {
      return { name: "E", emoji: "✊", category: "alphabet" };
    }
  }

  // F: OK sign
  if (!indexExtended && middleExtended && ringExtended && pinkyExtended) {
    if (distThumbIndex < 0.04) {
      return { name: "F / OK", emoji: "👌", category: "alphabet" };
    }
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
    const distThumbMiddle = getDistance(landmarks[4], landmarks[10]);
    if (distThumbMiddle < 0.05) {
      return { name: "K", emoji: "✌️", category: "alphabet" };
    }
  }

  // L: L shape
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && !isHorizontal) {
    return { name: "L", emoji: "☝️", category: "alphabet" };
  }

  // M: Thumb under 3 fingers
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (landmarks[4].x > landmarks[13].x) return { name: "M", emoji: "✊", category: "alphabet" };
  }

  // N: Thumb under 2 fingers
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    if (landmarks[4].x > landmarks[9].x && landmarks[4].x < landmarks[13].x) return { name: "N", emoji: "✊", category: "alphabet" };
  }

  // O: Circle
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const distThumbTips = getDistance(landmarks[4], landmarks[8]);
    if (distThumbTips < 0.05) return { name: "O", emoji: "👌", category: "alphabet" };
  }

  // P: Like K but down
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && isPointingDown) {
    return { name: "P", emoji: "✌️", category: "alphabet" };
  }

  // Q: Like G but down
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended && isPointingDown) {
    return { name: "Q", emoji: "🤏", category: "alphabet" };
  }

  // --- RESPONSES & EXPRESSIONS ---

  // Thumbs Up / Down
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (thumbUp) return { name: "Thumbs Up / YES", emoji: "👍", category: "response" };
    if (thumbDown) return { name: "Thumbs Down / NO", emoji: "👎", category: "response" };
  }

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

  // Spock / Vulcan Salute
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended && distMiddleRing > 0.08) {
    return { name: "Vulcan Salute", emoji: "🖖", category: "expression" };
  }

  // --- NUMBERS ---
  
  // One
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "One", emoji: "☝️", category: "number" };
  }
  
  // Two / Peace
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Two / Peace", emoji: "✌️", category: "number" };
  }
  
  // Three
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended && !thumbExtended) {
    return { name: "Three", emoji: "3️⃣", category: "number" };
  }
  
  // Four
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    return { name: "Four", emoji: "4️⃣", category: "number" };
  }

  return null;
}
