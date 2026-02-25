import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Camera, CameraOff, Info, Hand, Loader2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { classifyGesture, type GestureResult } from "@/lib/gestureClassifier";
import { HandLandmarkCanvas } from "@/components/HandLandmarkCanvas";
import { SignLanguageLibrary } from "@/components/SignLanguageLibrary";
import { LandmarkSmoother } from "@/lib/smoothing";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type SignTab = "camera" | "library";

interface SignLanguageRecognitionProps {
  onBack: () => void;
}

const commonSigns = [
  { sign: "Hello", emoji: "👋", description: "All fingers extended, open hand", category: "greeting" },
  { sign: "Thumbs Up", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "Fist", emoji: "✊", description: "All fingers closed into a fist", category: "response" },
  { sign: "OK", emoji: "👌", description: "Thumb + index tips touching, others up", category: "response" },
  { sign: "Peace", emoji: "✌️", description: "Index + middle up, rest closed", category: "expression" },
  { sign: "I Love You", emoji: "🤟", description: "Thumb + index + pinky extended", category: "expression" },
  { sign: "Rock On", emoji: "🤘", description: "Index + pinky up, no thumb", category: "expression" },
  { sign: "Call Me", emoji: "🤙", description: "Thumb + pinky extended like a phone", category: "expression" },
  { sign: "Vulcan Salute", emoji: "🖖", category: "expression", description: "Spock's greeting, split between middle and ring" },
  { sign: "One", emoji: "1️⃣", description: "Only index finger up", category: "number" },
  { sign: "Two", emoji: "2️⃣", description: "Index + middle up", category: "number" },
  { sign: "Three", emoji: "3️⃣", description: "Index + middle + ring up", category: "number" },
  { sign: "Four", emoji: "4️⃣", description: "All fingers up, thumb closed", category: "number" },
  { sign: "Five", emoji: "5️⃣", description: "All fingers up including thumb", category: "number" },
  { sign: "Point Up", emoji: "☝️", description: "Index finger pointing upwards", category: "direction" },
  { sign: "Point Right", emoji: "👉", description: "Index finger pointing to the right", category: "direction" },
  { sign: "Point Left", emoji: "👈", description: "Index finger pointing to the left", category: "direction" },
];

export function SignLanguageRecognition({ onBack }: SignLanguageRecognitionProps) {
  const [activeTab, setActiveTab] = useState<SignTab>("camera");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedSign, setDetectedSign] = useState<GestureResult | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<NormalizedLandmark[][]>([]);
  const [detectionLog, setDetectionLog] = useState<{ gesture: GestureResult; time: string }[]>([]);
  const lastDetectedRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const smoothersRef = useRef<LandmarkSmoother[]>([]);

  const { initModel, detect, isModelLoading, isModelReady } = useHandLandmarker();

  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    const result = detect(video);
    if (result && result.landmarks.length > 0) {
      // Ensure we have enough smoothers
      while (smoothersRef.current.length < result.landmarks.length) {
        smoothersRef.current.push(new LandmarkSmoother(5)); // Window size of 5 with weighted average for optimal stability/latency
      }

      // Apply smoothing to each hand
      const smoothedLandmarks = result.landmarks.map((handLandmarks, i) => 
        smoothersRef.current[i].add(handLandmarks)
      );

      setCurrentLandmarks(smoothedLandmarks);

      // Classify the first detected hand using smoothed data
      const gesture = classifyGesture(smoothedLandmarks[0]);
      if (gesture) {
        setDetectedSign(gesture);
        // Only log if different from last detection to avoid spam
        if (gesture.name !== lastDetectedRef.current) {
          lastDetectedRef.current = gesture.name;
          setDetectionLog((prev) => {
            const updated = [{ gesture, time: new Date().toLocaleTimeString() }, ...prev];
            return updated.slice(0, 20);
          });
        }
      } else {
        setDetectedSign(null);
        lastDetectedRef.current = null;
      }
    } else {
      setCurrentLandmarks([]);
      setDetectedSign(null);
      // Clear smoothers when no hands are detected to avoid "ghost" smoothing on re-entry
      smoothersRef.current.forEach(s => s.clear());
    }

    animFrameRef.current = requestAnimationFrame(runDetectionLoop);
  }, [detect]);

  const startCamera = async () => {
    try {
      // getUserMedia MUST be called first to preserve user gesture context
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setHasPermission(true);

      // Init model after camera is running
      await initModel();
    } catch (error) {
      console.error("Camera access denied:", error);
      setHasPermission(false);
    }
  };

  // Start detection loop once camera is active and model ready
  useEffect(() => {
    if (isCameraActive && isModelReady) {
      animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, isModelReady, runDetectionLoop]);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setDetectedSign(null);
    setCurrentLandmarks([]);
    smoothersRef.current.forEach(s => s.clear());
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-slate-50 px-4 py-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sign Language</h1>
            <p className="text-slate-600">Recognition & Library</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-2 rounded-xl bg-slate-200 p-1">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "camera"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Camera className="h-4 w-4" />
            Live Recognition
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "library"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Sign Library
          </button>
        </div>

        {activeTab === "camera" ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Camera View */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900 shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${isCameraActive ? '' : 'hidden'}`}
              />
              {isCameraActive && (
                <>
                  <HandLandmarkCanvas
                    landmarks={currentLandmarks}
                    width={640}
                    height={480}
                  />

                  {/* Detection overlay */}
                  <AnimatePresence>
                    {detectedSign && (
                       <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-emerald-600 px-6 py-3 text-white shadow-xl"
                      >
                        <p className="text-lg font-semibold">{detectedSign.emoji} {detectedSign.name}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recording indicator */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-slate-900">Live</span>
                  </div>
                </>
              )}
              {!isCameraActive && (
                <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-4 p-8">
                  {isModelLoading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                      <p className="text-center text-slate-400">
                        Loading AI model...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-slate-800 p-6">
                        <Camera className="h-12 w-12 text-slate-600" />
                      </div>
                      <p className="text-center text-slate-400">
                        {hasPermission === false
                          ? "Camera access was denied. Please enable it in your browser settings."
                          : "Enable your camera to start sign language recognition"}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-4 flex justify-center">
              <Button
                variant={isCameraActive ? "destructive" : "hero"}
                size="lg"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="gap-2"
                disabled={isModelLoading}
              >
                {isModelLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading Model...
                  </>
                ) : isCameraActive ? (
                  <>
                    <CameraOff className="h-5 w-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Start Camera
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Detection Log */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Hand className="h-5 w-5 text-emerald-600" />
                  Recognition Log
                  {detectionLog.length > 0 && (
                    <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {detectionLog.length}
                    </span>
                  )}
                </h2>
                {detectionLog.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setDetectionLog([])} className="h-7 gap-1 text-xs text-slate-500">
                    <Trash2 className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              <div className="min-h-[120px] max-h-[280px] overflow-y-auto rounded-xl bg-slate-50 p-3">
                {detectionLog.length > 0 ? (
                  <ul className="space-y-2">
                    {detectionLog.map((entry, i) => (
                      <motion.li
                        key={`${entry.gesture.name}-${entry.time}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 rounded-lg bg-white p-2.5 shadow-sm border border-slate-100"
                      >
                        <span className="text-xl">{entry.gesture.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{entry.gesture.name}</p>
                          <p className="text-xs text-slate-500">{entry.gesture.category}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{entry.time}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">
                    {isCameraActive
                      ? "Show a hand gesture to the camera..."
                      : "Start the camera to begin recognition"}
                  </p>
                )}
              </div>
            </div>

            {/* Common Signs Reference */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Info className="h-5 w-5 text-emerald-600" />
                Supported Gestures
                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {commonSigns.length}
                </span>
              </h2>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {commonSigns.map((item) => (
                  <div
                    key={item.sign}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{item.sign}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <SignLanguageLibrary />
        )}
      </div>
    </motion.div>
  );
}
