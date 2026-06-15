import React, { useState, useEffect, useRef } from 'react';
import { Camera, Smile, Video, VideoOff, Activity, Heart } from 'lucide-react';

interface EmotionState {
  emotion: string;
  painIndex: number;
  stressIndex: number;
  confidence: number;
  impact: string;
  recommendation: string;
}

const EmotionSequences: EmotionState[] = [
  { emotion: 'PAIN DISTRESS', painIndex: 82, stressIndex: 75, confidence: 94.5, impact: 'High risk of autonomic spike / circulatory load.', recommendation: 'Administer prescribed analgesic; log pain scale event.' },
  { emotion: 'STRESSED / ANXIOUS', painIndex: 30, stressIndex: 88, confidence: 91.2, impact: 'Secondary respiratory rate spike warning.', recommendation: 'Nurse bedside check; coordinate breathing support adjustment.' },
  { emotion: 'STABLE / COMFORTABLE', painIndex: 12, stressIndex: 20, confidence: 96.8, impact: 'Normal autonomic balance.', recommendation: 'Continue scheduled monitoring protocol.' }
];

const EmotionDetection: React.FC = () => {
  const [sequenceIdx, setSequenceIdx] = useState(0);
  const [feedActive, setFeedActive] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 100, y: 55 });
  const [rppgHr, setRppgHr] = useState(72);
  const [rppgSpo2, setRppgSpo2] = useState(98);

  useEffect(() => {
    if (!feedActive || webcamActive) return;
    const interval = setInterval(() => {
      setSequenceIdx(prev => (prev + 1) % EmotionSequences.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [feedActive, webcamActive]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, webcamActive]);

  // Clean up media stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Live rPPG Waveform Oscilloscope Drawing Loop
  useEffect(() => {
    if (!webcamActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const points: number[] = [];
    const bufferSize = 120;

    // Prefill buffer
    for (let i = 0; i < bufferSize; i++) {
      points.push(40);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simulate cardiac QRS pulse wave mathematically
      const time = Date.now() * 0.005;
      // Combine sine wave with random minor fluctuations
      let val = Math.sin(time) * 15 + Math.sin(time * 3) * 5;
      
      // Add QRS-like cardiac peak every cycle
      const period = Math.floor(time) % 2;
      if (period === 0 && Math.random() > 0.7) {
        val -= 25; // Peak spike
      }

      points.push(40 + val);
      if (points.length > bufferSize) {
        points.shift();
      }

      // Draw grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let gridX = 0; gridX < canvas.width; gridX += 20) {
        ctx.beginPath();
        ctx.moveTo(gridX, 0);
        ctx.lineTo(gridX, canvas.height);
        ctx.stroke();
      }
      for (let gridY = 0; gridY < canvas.height; gridY += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(canvas.width, gridY);
        ctx.stroke();
      }

      // Draw pulse line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / bufferSize;
      for (let i = 0; i < points.length; i++) {
        const drawX = i * sliceWidth;
        const drawY = points[i];
        if (i === 0) {
          ctx.moveTo(drawX, drawY);
        } else {
          ctx.lineTo(drawX, drawY);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Dynamic minor fluctuation in vital readouts based on pixel wave
      if (Math.random() > 0.96) {
        setRppgHr(h => Math.max(68, Math.min(84, h + (Math.random() > 0.5 ? 1 : -1))));
        setRppgSpo2(s => Math.max(96, Math.min(100, s + (Math.random() > 0.8 ? 1 : -1))));
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [webcamActive]);

  const toggleWebcam = async () => {
    if (webcamActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setWebcamActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        setStream(mediaStream);
        setWebcamActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Unable to access the web camera for emotion monitoring. Please verify permissions.");
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 120;
    setMousePos({ x, y });
  };

  const active = EmotionSequences[sequenceIdx];

  const fx = mousePos.x;
  const fy = mousePos.y;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Simulated face tracking feed */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-clinical-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Patient Face Analysis — Bed 104</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Live feed</span>
            </div>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-crosshair"
          >
            {feedActive ? (
              <>
                {webcamActive && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-900/10" />
                  </>
                )}

                <div className="absolute inset-x-0 h-[2px] bg-medical-accent/15 top-0 animate-scan" />

                <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800/80 z-10">
                  CAM-104_WARD_GENERAL
                </div>

                {/* Face wireframe overlay mock centered around mouse pointer */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 200 120">
                    {/* Face boundary */}
                    <ellipse cx={fx} cy={fy} rx="26" ry="32" stroke="#3b82f6" strokeWidth="0.75" fill="transparent" strokeDasharray="3 3" />
                    {/* Eyes tracking boxes */}
                    <rect x={fx - 14} y={fy - 10} width="8" height="4" stroke="#10b981" strokeWidth="0.5" fill="transparent" />
                    <rect x={fx + 6} y={fy - 10} width="8" height="4" stroke="#10b981" strokeWidth="0.5" fill="transparent" />
                    {/* Nose line */}
                    <line x1={fx} y1={fy - 6} x2={fx} y2={fy + 6} stroke="#10b981" strokeWidth="0.5" />
                    {/* Mouth mapping */}
                    <path d={`M ${fx - 12} ${fy + 14} Q ${fx} ${fy + (active.emotion === 'PAIN DISTRESS' ? 18 : 12)} ${fx + 12} ${fy + 14}`} stroke="#ef4444" strokeWidth="0.75" fill="transparent" />
                  </svg>
                </div>

                {/* Contactless rPPG overlay bounding box */}
                <div className="absolute top-1/4 left-1/4 w-28 h-28 border border-dashed border-emerald-500/40 rounded-lg pointer-events-none">
                  <span className="absolute top-1 left-1 text-[8px] font-black uppercase text-emerald-400 font-mono bg-slate-900/80 px-1 rounded">rPPG Scan Zone</span>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-1.5 z-10">
                  <span className="text-[10px] bg-slate-900/80 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-800/80">
                    MediaPipe Facemesh v3.0 (Hover/Move Mouse to Test Tracker)
                  </span>
                </div>

                {/* Webcam toggle */}
                <button
                  onClick={toggleWebcam}
                  className="absolute bottom-4 right-4 p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all z-10 flex items-center gap-1.5"
                >
                  {webcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-bold uppercase">{webcamActive ? 'Stop WebCam' : 'Live WebCam'}</span>
                </button>
              </>
            ) : (
              <div className="text-slate-500 text-xs font-semibold">Feed Offline</div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 text-xs">
            <span className="text-slate-400">FPS: 30 • Facemesh Nodes: 468</span>
            <button
              onClick={() => setFeedActive(!feedActive)}
              className="text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/60"
            >
              {feedActive ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>
        </div>

        {/* Contactless rPPG Vitals Monitor Panel */}
        {webcamActive && (
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800 animate-slide-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/85 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">Contactless rPPG Vitals Monitor</h4>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-mono">
                Face Refraction scan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={80}
                  className="w-full bg-slate-950/60 rounded-xl border border-slate-800/60"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated HR</span>
                  </div>
                  <strong className="text-base font-mono font-bold text-slate-100">{rppgHr} BPM</strong>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">rPPG SpO₂</span>
                  </div>
                  <strong className="text-base font-mono font-bold text-slate-100">{rppgSpo2}%</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Metrics breakdown */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Emotion telemetry</h3>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Detected Class</span>
              <span className="font-mono text-[10px] font-bold text-slate-400">{active.confidence}% confidence</span>
            </div>
            <strong className="text-base text-slate-100">{active.emotion}</strong>
            
            <div className="space-y-3.5 border-t border-slate-900/80 pt-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-400 uppercase tracking-wider">Pain Index</span>
                  <span className="font-mono text-slate-200">{active.painIndex}/100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${active.painIndex}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-400 uppercase tracking-wider">Stress Index</span>
                  <span className="font-mono text-slate-200">{active.stressIndex}/100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${active.stressIndex}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Physiological Impact</h3>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">AI Assessment</span>
              <p className="text-xs text-slate-200 mt-0.5">{active.impact}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Care Action</span>
              <p className="text-xs text-slate-200 mt-0.5 font-medium">{active.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetection;
