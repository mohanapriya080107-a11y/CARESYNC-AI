import React, { useState, useEffect, useRef } from 'react';
import { Camera, Heart, Thermometer, Wind, Eye, AlertTriangle, Shield, Video, VideoOff } from 'lucide-react';

const feeds = [
  { id: 1, label: 'ICU Bed 101 — Robert Carter', ward: 'ICU', status: 'CRITICAL', hr: 132, spo2: 85, temp: 39.2, rr: 32, bp: '85/50', detection: 'Restless Movement' },
  { id: 2, label: 'ICU Bed 105 — Emily Hall', ward: 'ICU', status: 'STABLE', hr: 74, spo2: 98, temp: 36.8, rr: 14, bp: '118/76', detection: 'Sleeping' },
  { id: 3, label: 'ER Bed 103 — Marcus Miller', ward: 'ER', status: 'CRITICAL', hr: 126, spo2: 88, temp: 38.4, rr: 29, bp: '92/58', detection: 'Labored Breathing' },
  { id: 4, label: 'GW Bed 104 — Sofia Martinez', ward: 'General', status: 'HIGH RISK', hr: 114, spo2: 92, temp: 37.6, rr: 22, bp: '158/95', detection: 'Awake – Normal' },
];

const statusColor: Record<string, string> = {
  CRITICAL: 'bg-clinical-critical/20 text-clinical-critical border-clinical-critical/40',
  'HIGH RISK': 'bg-clinical-highRisk/20 text-clinical-highRisk border-clinical-highRisk/40',
  STABLE: 'bg-clinical-stable/20 text-clinical-stable border-clinical-stable/40',
};

const CameraMonitoring: React.FC = () => {
  const [tick, setTick] = useState(0);
  const [webcamActiveId, setWebcamActiveId] = useState<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, webcamActiveId]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleWebcam = async (feedId: number) => {
    if (webcamActiveId === feedId) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setWebcamActiveId(null);
    } else {
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        setStream(mediaStream);
        setWebcamActiveId(feedId);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Unable to access the web camera. Please ensure permissions are granted.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="w-5 h-5 text-medical-accent" /> Live Camera Monitoring</h2>
          <p className="text-xs text-slate-400 mt-1">Computer vision-powered patient surveillance (supports live web camera toggle)</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-clinical-stable"><span className="w-2 h-2 rounded-full bg-clinical-stable animate-pulse" /> LIVE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map(f => {
          const isWebcamActive = webcamActiveId === f.id;
          return (
            <div key={f.id} className="glass-panel overflow-hidden group border border-slate-800">
              {/* Simulated or Live Camera Feed */}
              <div className="relative h-52 bg-slate-950 overflow-hidden">
                {isWebcamActive && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                  </>
                )}

                {/* Scan line */}
                <div className="absolute left-0 w-full h-[2px] bg-medical-accent/30 animate-scan" />

                {/* Face Bounding Box */}
                <div className="absolute top-8 left-12 w-32 h-36 border-2 border-medical-accent/50 rounded-lg">
                  <span className="absolute -top-5 left-0 text-[9px] bg-medical-primary/80 text-white px-1.5 py-0.5 rounded font-bold">PATIENT</span>
                  {f.status === 'CRITICAL' && <span className="absolute -bottom-5 left-0 text-[9px] bg-clinical-critical/80 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">⚠ {f.detection}</span>}
                </div>

                {/* Vital overlay */}
                <div className="absolute top-3 right-3 space-y-1 z-10">
                  {[
                    { icon: Heart, val: `${f.hr + (tick % 3 - 1)} BPM`, color: f.hr > 100 ? 'text-clinical-critical' : 'text-clinical-stable' },
                    { icon: Wind, val: `SpO₂ ${f.spo2}%`, color: f.spo2 < 92 ? 'text-clinical-critical' : 'text-clinical-stable' },
                    { icon: Thermometer, val: `${f.temp}°C`, color: f.temp > 38 ? 'text-clinical-warning' : 'text-slate-400' },
                  ].map((v, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-slate-950/85 px-2 py-1 rounded-md border border-slate-800/80">
                      <v.icon className={`w-3 h-3 ${v.color}`} />
                      <span className={`text-[10px] font-bold font-mono ${v.color}`}>{v.val}</span>
                    </div>
                  ))}
                </div>

                {/* Camera label */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800/80">
                  <span className="w-2 h-2 rounded-full bg-clinical-critical animate-pulse" />
                  <span className="text-[10px] text-slate-300 font-mono">CAM-{f.id}</span>
                </div>

                {/* Camera toggle overlay */}
                <button
                  onClick={() => toggleWebcam(f.id)}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all z-10 flex items-center gap-1"
                >
                  {isWebcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  <span className="text-[9px] font-bold uppercase">{isWebcamActive ? 'Stop WebCam' : 'Live WebCam'}</span>
                </button>
              </div>

              {/* Info bar */}
              <div className="p-3 flex items-center justify-between bg-slate-900/60 border-t border-slate-800/50">
                <div>
                  <p className="text-xs font-bold text-slate-200">{f.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusColor[f.status]}`}>{f.status}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3 text-slate-500" />{f.detection}</span>
                  </div>
                </div>
                {f.status === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-clinical-critical animate-pulse animate-duration-1000" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-5 border border-slate-800 bg-slate-950/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-medical-accent" /> Detection Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Movement Detected', value: '2', color: 'text-clinical-warning' },
            { label: 'Fall Risk', value: '0', color: 'text-clinical-stable' },
            { label: 'Sleep Monitoring', value: '1', color: 'text-clinical-accent' },
            { label: 'Activity Alerts', value: '3', color: 'text-clinical-critical' },
          ].map((d, i) => (
            <div key={i} className="p-3 rounded-xl border border-clinical-border bg-slate-900/40 text-center">
              <p className={`text-xl font-bold ${d.color}`}>{d.value}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CameraMonitoring;
