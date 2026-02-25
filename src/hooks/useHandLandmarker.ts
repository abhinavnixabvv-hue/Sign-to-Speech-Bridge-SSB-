import { useState, useCallback, useRef, useEffect } from 'react';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export function useHandLandmarker() {
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  const initModel = useCallback(async () => {
    if (landmarker) return;
    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      setLandmarker(handLandmarker);
      setIsModelReady(true);
    } catch (error) {
      console.error("Error initializing HandLandmarker:", error);
    } finally {
      setIsModelLoading(false);
    }
  }, [landmarker]);

  const detect = useCallback((video: HTMLVideoElement): HandLandmarkerResult | null => {
    if (!landmarker || video.readyState < 2) return null;
    const nowInMs = Date.now();
    return landmarker.detectForVideo(video, nowInMs);
  }, [landmarker]);

  return { initModel, detect, isModelLoading, isModelReady };
}
