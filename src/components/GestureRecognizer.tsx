import React, { useEffect, useRef, useState } from 'react';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';
import { Camera, RefreshCw, Volume2, AlertCircle, Hand } from 'lucide-react';

interface GestureResult {
  categoryName: string;
  score: number;
}

export default function GestureRecognizerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('VIDEO');
  const [lastResult, setLastResult] = useState<GestureResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const initGestureRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: runningMode
        });
        setGestureRecognizer(recognizer);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Gesture Recognizer:", err);
        setError("Failed to load MediaPipe models. Please check your connection.");
        setIsLoading(false);
      }
    };

    initGestureRecognizer();
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  let lastVideoTime = -1;
  const predictWebcam = async () => {
    if (!gestureRecognizer || !videoRef.current || !isCameraActive) return;

    const nowInMs = Date.now();
    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const results = gestureRecognizer.recognizeForVideo(videoRef.current, nowInMs);

      if (results.gestures.length > 0) {
        const topGesture = results.gestures[0][0];
        setLastResult({
          categoryName: topGesture.categoryName,
          score: topGesture.score
        });
      } else {
        setLastResult(null);
      }
    }

    if (isCameraActive) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Live Gesture Recognition</h3>
            <p className="text-xs text-slate-500">Powered by MediaPipe</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCameraActive ? (
            <button 
              onClick={startCamera}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Start Camera
            </button>
          ) : (
            <button 
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Stop Camera
            </button>
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
        {isLoading && (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-sm font-medium">Initializing MediaPipe...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-white p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && !isCameraActive && (
          <div className="text-center text-slate-400">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Camera is inactive. Click "Start Camera" to begin.</p>
          </div>
        )}

        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
        />
        
        {lastResult && isCameraActive && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Detected Gesture</p>
                <h4 className="text-2xl font-bold text-slate-900">{lastResult.categoryName}</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="font-mono font-bold text-slate-900">{(lastResult.score * 100).toFixed(1)}%</p>
                </div>
                <button 
                  onClick={() => speak(lastResult.categoryName)}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Note:</span> This demo uses the standard MediaPipe gesture model. 
            The full SSB project uses a custom-trained model for specific ISL and Malayalam characters 
            as described in the project abstract.
          </p>
        </div>
      </div>
    </div>
  );
}
