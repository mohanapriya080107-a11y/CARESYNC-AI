import React, { useState, useEffect, useRef } from 'react';
import { Camera, Hand, AlertTriangle, Video, VideoOff } from 'lucide-react';

interface GesturePreset {
  gesture: string;
  confidence: number;
  description: string;
  action: string;
  emergency: boolean;
}

const HandSignPresets: GesturePreset[] = [
  { gesture: 'HELP GESTURE', confidence: 97.4, description: 'Patient signaling for immediate nurse attendance.', action: 'Dispatched ward nurse to Bed 102.', emergency: true },
  { gesture: 'OK SIGN', confidence: 94.2, description: 'Patient indicating comfort status after medication.', action: 'Log response: comfort verified.', emergency: false },
  { gesture: 'WATER REQUEST', confidence: 89.5, description: 'Patient indicating thirst or dietary support requirement.', action: 'Notify dietary care team.', emergency: false },
  { gesture: 'SEVERE PAIN SIGN', confidence: 96.1, description: 'Fist held over chest indicating pain spike.', action: 'Trigger pain protocol notification.', emergency: true }
];

const HandSignDetection: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedActive, setFeedActive] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 100, y: 60 });

  useEffect(() => {
    if (!feedActive || webcamActive) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % HandSignPresets.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [feedActive, webcamActive]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, webcamActive]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
        alert("Unable to access the web camera for gesture detection. Please ensure permissions are granted.");
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 120;
    setMousePos({ x, y });
  };

  const active = HandSignPresets[currentIdx];

  // Derive skeleton points dynamically based on mouse position to create responsive tracking
  const cx = mousePos.x;
  const cy = mousePos.y;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Simulated camera with tracking landmarks */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-clinical-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Patient Gesture telemetry — Bed 102</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Live feed</span>
            </div>
          </div>

          {/* Camera Frame */}
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
                    {/* Simulated scan line */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-900/10" />
                  </>
                )}

                <div className="absolute inset-x-0 h-[2px] bg-medical-accent/15 top-0 animate-scan" />

                {/* Hospital overlay text */}
                <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800/80">
                  CAM-102_WARD_ICU
                </div>

                {/* Live gesture landmark tracking overlay mock */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Drawing virtual lines & nodes */}
                  <svg className="w-full h-full" viewBox="0 0 200 120">
                    {/* Palm nodes centered at mouse pointer or drifting */}
                    <circle cx={cx} cy={cy} r="2.5" fill="#10b981" className="shadow-[0_0_8px_#10b981]" />
                    <circle cx={cx - 15} cy={cy - 10} r="2" fill="#10b981" />
                    <circle cx={cx - 5} cy={cy - 30} r="2" fill="#10b981" />
                    <circle cx={cx + 10} cy={cy - 28} r="2" fill="#10b981" />
                    <circle cx={cx + 20} cy={cy - 15} r="2" fill="#10b981" />
                    {/* Skeleton lines */}
                    <line x1={cx} y1={cy} x2={cx - 15} y2={cy - 10} stroke="#10b981" strokeWidth="0.75" />
                    <line x1={cx - 15} y1={cy - 10} x2={cx - 5} y2={cy - 30} stroke="#10b981" strokeWidth="0.75" />
                    <line x1={cx - 5} y1={cy - 30} x2={cx + 10} y2={cy - 28} stroke="#10b981" strokeWidth="0.75" />
                    <line x1={cx + 10} y1={cy - 28} x2={cx + 20} y2={cy - 15} stroke="#10b981" strokeWidth="0.75" />
                    <line x1={cx + 20} y1={cy - 15} x2={cx} y2={cy} stroke="#10b981" strokeWidth="0.75" />
                  </svg>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-1.5 z-10">
                  <span className="text-[10px] bg-slate-900/80 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-800/80">
                    MediaPipe Joint Engine v2.1 (Hover/Move Mouse to Test Tracking)
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
            <span className="text-slate-400">Model accuracy threshold: 85%</span>
            <button
              onClick={() => setFeedActive(!feedActive)}
              className="text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/60"
            >
              {feedActive ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Detected gesture summary */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Hand className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Recognized gesture</h3>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Status</span>
              {active.emergency ? (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  CRITICAL
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  STABLE
                </span>
              )}
            </div>
            <strong className="text-base text-slate-100">{active.gesture}</strong>
            <p className="text-xs text-slate-400">{active.description}</p>
            
            <div className="border-t border-slate-900/80 pt-3">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block mb-1">Classifier Confidence</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-medical-accent h-full rounded-full" style={{ width: `${active.confidence}%` }}></div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">{active.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">AI Recommendation</h3>
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">Recommended Response Action</span>
            <p className="text-xs font-medium text-slate-200">{active.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandSignDetection;
