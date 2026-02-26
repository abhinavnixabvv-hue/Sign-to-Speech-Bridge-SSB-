import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Camera, CameraOff, Info, Hand, Loader2, Trash2, BookOpen, Type, Siren, Activity, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { classifyGesture, type GestureResult } from "@/lib/gestureClassifier";
import { HandLandmarkCanvas } from "@/components/HandLandmarkCanvas";
import { SignLanguageLibrary } from "@/components/SignLanguageLibrary";
import { TextToSign } from "@/components/TextToSign";
import { EmergencySigns } from "@/components/EmergencySigns";
import { ModelInsights } from "@/components/ModelInsights";
import { LandmarkDataCollector } from "@/components/LandmarkDataCollector";
import { LandmarkSmoother } from "@/lib/smoothing";
import { KNNClassifier } from "@/lib/knnClassifier";
import { customTrainingData } from "@/lib/customData";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type SignLanguage = 'ASL' | 'ISL';

type SignTab = "camera" | "library" | "textToSign" | "emergency" | "insights" | "collector";

interface SignLanguageRecognitionProps {
  onBack: () => void;
}

const aslSigns = [
  { sign: "A", emoji: "✊", description: "Fist, thumb on side", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Open hand, fingers together", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up, others touch thumb", category: "alphabet" },
  { sign: "E", emoji: "✊", description: "Fist, fingers curled over thumb", category: "alphabet" },
  { sign: "F", emoji: "👌", description: "OK sign, thumb and index touch", category: "alphabet" },
  { sign: "G", emoji: "🤏", description: "Index and thumb pointing forward", category: "alphabet" },
  { sign: "H", emoji: "✌️", description: "Index and middle pointing forward", category: "alphabet" },
  { sign: "I", emoji: "☝️", description: "Pinky finger up", category: "alphabet" },
  { sign: "K", emoji: "✌️", description: "Index and middle up, thumb touches middle", category: "alphabet" },
  { sign: "L", emoji: "☝️", description: "L shape with thumb and index", category: "alphabet" },
  { sign: "M", emoji: "✊", description: "Thumb under three fingers", category: "alphabet" },
  { sign: "N", emoji: "✊", description: "Thumb under two fingers", category: "alphabet" },
  { sign: "O", emoji: "👌", description: "Circle with all fingers and thumb", category: "alphabet" },
  { sign: "P", emoji: "✌️", description: "K sign pointing downwards", category: "alphabet" },
  { sign: "Q", emoji: "🤏", description: "G sign pointing downwards", category: "alphabet" },
  { sign: "R", emoji: "🤞", description: "Index and middle crossed", category: "alphabet" },
  { sign: "S", emoji: "✊", description: "Fist, thumb over fingers", category: "alphabet" },
  { sign: "T", emoji: "✊", description: "Thumb under index finger", category: "alphabet" },
  { sign: "U", emoji: "✌️", description: "Index and middle up and together", category: "alphabet" },
  { sign: "V", emoji: "✌️", description: "Index and middle up and apart", category: "alphabet" },
  { sign: "W", emoji: "✋", description: "Index, middle, and ring fingers up", category: "alphabet" },
  { sign: "X", emoji: "☝️", description: "Index finger hooked", category: "alphabet" },
  { sign: "Y", emoji: "🤙", description: "Thumb and pinky extended", category: "alphabet" },
  { sign: "Z", emoji: "☝️", description: "Index finger draws a Z", category: "alphabet" },
  { sign: "HELP", emoji: "🆘", description: "Thumb up with middle finger extended", category: "emergency" },
  { sign: "HELLO", emoji: "👋", description: "Open hand, all fingers extended", category: "greeting" },
  { sign: "Thumbs Up / YES", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down / NO", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "I Love You", emoji: "🤟", description: "Thumb + index + pinky extended", category: "expression" },
  { sign: "Rock On", emoji: "🤘", description: "Index + pinky up, no thumb", category: "expression" },
  { sign: "Vulcan Salute", emoji: "🖖", category: "expression", description: "Spock's greeting, split between middle and ring" },
  { sign: "Three", emoji: "3️⃣", description: "Index + middle + ring up", category: "number" },
  { sign: "Four", emoji: "4️⃣", description: "All fingers up, thumb closed", category: "number" },
];

const islSigns = [
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
];

export function SignLanguageRecognition({ onBack }: SignLanguageRecognitionProps) {
  const [activeTab, setActiveTab] = useState<SignTab>("camera");
  const [language, setLanguage] = useState<SignLanguage>("ASL");
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
  const knnRef = useRef<KNNClassifier>(new KNNClassifier(customTrainingData));

  const commonSigns = language === 'ASL' ? aslSigns : islSigns;

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
      let gesture = classifyGesture(smoothedLandmarks[0]);
      
      // If rule-based fails or for specific complex signs, use KNN
      if (!gesture || gesture.name === "HELP" || gesture.name === "HELLO") {
        const knnResult = knnRef.current.predict(smoothedLandmarks[0]);
        if (knnResult && knnResult.confidence > 0.6) {
          const signInfo = commonSigns.find(s => s.sign === knnResult.label);
          if (signInfo) {
            gesture = { 
              name: signInfo.sign, 
              emoji: signInfo.emoji, 
              category: signInfo.category 
            };
          }
        }
      }

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

        {/* Tab Switcher & Language Selector */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 rounded-xl bg-slate-200 p-1 w-full sm:w-auto">
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
            <button
              onClick={() => setActiveTab("textToSign")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "textToSign"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Type className="h-4 w-4" />
              Text to Sign
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "emergency"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Siren className="h-4 w-4" />
              Emergency
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "insights"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Activity className="h-4 w-4" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab("collector")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "collector"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Database className="h-4 w-4" />
              Data Collector
            </button>
          </div>

          <div className="flex gap-2 bg-emerald-100/50 p-1 rounded-xl border border-emerald-200 w-full sm:w-auto">
            <button
              onClick={() => setLanguage('ASL')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                language === 'ASL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ASL
            </button>
            <button
              onClick={() => setLanguage('ISL')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                language === 'ISL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ISL
            </button>
          </div>
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
                      <div className="text-center">
                        <p className="text-slate-400 mb-4 max-w-xs">
                          {hasPermission === false
                            ? "Camera access was denied. Please check your browser settings and ensure you have granted permission to this site."
                            : "Enable your camera to start sign language recognition"}
                        </p>
                        {hasPermission === false && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setHasPermission(null);
                              startCamera();
                            }}
                            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                          >
                            Try Again
                          </Button>
                        )}
                      </div>
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
        ) : activeTab === "library" ? (
          <SignLanguageLibrary language={language} />
        ) : activeTab === "textToSign" ? (
          <TextToSign />
        ) : activeTab === "insights" ? (
          <ModelInsights />
        ) : activeTab === "collector" ? (
          <LandmarkDataCollector />
        ) : (
          <EmergencySigns />
        )}
      </div>
    </motion.div>
  );
}
