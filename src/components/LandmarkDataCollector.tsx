import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Download, Trash2, Play, Square, Save, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandLandmarker } from '@/hooks/useHandLandmarker';
import { HandLandmarkCanvas } from '@/components/HandLandmarkCanvas';
import { LandmarkSmoother } from '@/lib/smoothing';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface CapturedData {
  label: string;
  landmarks: number[]; // 63 values (21 * 3)
  timestamp: number;
}

export function LandmarkDataCollector() {
  const [label, setLabel] = useState('A');
  const [isRecording, setIsRecording] = useState(false);
  const [collectedData, setCollectedData] = useState<CapturedData[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<NormalizedLandmark[][]>([]);
  
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
      while (smoothersRef.current.length < result.landmarks.length) {
        smoothersRef.current.push(new LandmarkSmoother(5));
      }

      const smoothedLandmarks = result.landmarks.map((handLandmarks, i) => 
        smoothersRef.current[i].add(handLandmarks)
      );

      setCurrentLandmarks(smoothedLandmarks);

      if (isRecording) {
        // Capture the first hand's landmarks
        const hand = smoothedLandmarks[0];
        const flattened = hand.flatMap(l => [l.x, l.y, l.z]);
        
        setCollectedData(prev => [
          ...prev,
          { label, landmarks: flattened, timestamp: Date.now() }
        ]);
      }
    } else {
      setCurrentLandmarks([]);
      smoothersRef.current.forEach(s => s.clear());
    }

    animFrameRef.current = requestAnimationFrame(runDetectionLoop);
  }, [detect, isRecording, label]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      await initModel();
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setCurrentLandmarks([]);
    setIsRecording(false);
  };

  useEffect(() => {
    if (isCameraActive && isModelReady) {
      animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, isModelReady, runDetectionLoop]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const exportToCSV = () => {
    if (collectedData.length === 0) return;

    // Create header: label, x0, y0, z0, x1, y1, z1, ..., x20, y20, z20
    const headers = ['label'];
    for (let i = 0; i < 21; i++) {
      headers.push(`x${i}`, `y${i}`, `z${i}`);
    }

    const csvRows = [headers.join(',')];
    collectedData.forEach(item => {
      const row = [item.label, ...item.landmarks.map(v => v.toFixed(6))];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asl_landmarks_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all collected data?')) {
      setCollectedData([]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" />
            Landmark Data Collector
          </h2>
          <p className="text-slate-600">Record hand landmarks to train your own TensorFlow model</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={clearData}
            disabled={collectedData.length === 0}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
          <Button 
            variant="hero" 
            onClick={exportToCSV}
            disabled={collectedData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV ({collectedData.length})
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recording Controls & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-900 shadow-xl">
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
                {isRecording && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                    <Square className="h-3 w-3 fill-current" /> RECORDING: {label}
                  </div>
                )}
              </>
            )}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Database className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-white font-bold mb-2">Ready to Collect Data?</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-6">
                  Start the camera to begin capturing 21 hand landmarks for your custom gestures.
                </p>
                <Button variant="hero" onClick={startCamera} disabled={isModelLoading}>
                  {isModelLoading ? 'Loading AI...' : 'Start Camera'}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gesture Label</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value.toUpperCase())}
                  placeholder="e.g. HELP"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'HELP', 'YES', 'NO'].map(l => (
                    <button 
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${label === l ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="lg"
                variant={isRecording ? "destructive" : "hero"}
                onClick={() => setIsRecording(!isRecording)}
                disabled={!isCameraActive || !isModelReady}
                className="h-14 px-8 rounded-2xl shadow-lg"
              >
                {isRecording ? (
                  <><Square className="h-5 w-5 mr-2 fill-current" /> Stop Recording</>
                ) : (
                  <><Play className="h-5 w-5 mr-2 fill-current" /> Start Recording</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Data Summary & Instructions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              How to Collect
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Enter the name of the gesture you want to record.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Hold your hand in the correct pose in front of the camera.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Click <b>Start Recording</b>. Move your hand slightly to capture different angles.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Export the CSV and use it to train your model in Python/TensorFlow.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4">Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 text-sm">Total Samples</span>
                <span className="text-2xl font-bold text-emerald-400">{collectedData.length}</span>
              </div>
              
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {Object.entries(
                  collectedData.reduce((acc, curr) => {
                    acc[curr.label] = (acc[curr.label] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([l, count]) => (
                  <div key={l} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">{l}</span>
                    <span className="text-slate-500">{count} samples</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
