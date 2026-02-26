import React, { useEffect, useRef } from 'react';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface HandLandmarkCanvasProps {
  landmarks: NormalizedLandmark[][];
  width: number;
  height: number;
}

export function HandLandmarkCanvas({ landmarks, width, height }: HandLandmarkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (landmarks.length === 0) return;

    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    landmarks.forEach(handLandmarks => {
      // Draw connections
      const connections = [
        [0, 1, 2, 3, 4], // Thumb
        [0, 5, 6, 7, 8], // Index
        [0, 9, 10, 11, 12], // Middle
        [0, 13, 14, 15, 16], // Ring
        [0, 17, 18, 19, 20], // Pinky
        [5, 9, 13, 17, 5] // Palm
      ];

      connections.forEach(conn => {
        ctx.beginPath();
        for (let i = 0; i < conn.length; i++) {
          const landmark = handLandmarks[conn[i]];
          if (i === 0) ctx.moveTo(landmark.x * canvas.width, landmark.y * canvas.height);
          else ctx.lineTo(landmark.x * canvas.width, landmark.y * canvas.height);
        }
        ctx.stroke();
      });

      // Draw points
      ctx.fillStyle = '#ffffff';
      handLandmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    });
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}
