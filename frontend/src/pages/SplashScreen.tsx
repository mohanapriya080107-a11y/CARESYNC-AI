import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing AI Healthcare Systems...');

  useEffect(() => {
    const statuses = [
      'Initializing AI Healthcare Systems...',
      'Loading Patient Neural Networks...',
      'Connecting Digital Twin Engine...',
      'Calibrating Predictive Models...',
      'System Ready'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(step * 25, 100));
      if (step < statuses.length) {
        setStatusText(statuses[step]);
      }
    }, 600);

    const timer = setTimeout(() => {
      navigate('/login');
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-medical-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-clinical-accent/10 rounded-full blur-[80px]" />

      {/* ECG Line Animation */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] overflow-hidden opacity-20">
        <svg className="animate-ecg w-[200%] h-12 -mt-5" viewBox="0 0 600 50" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            points="0,25 100,25 120,25 130,10 140,40 150,5 160,45 170,25 200,25 300,25 320,25 330,10 340,40 350,5 360,45 370,25 400,25 500,25 520,25 530,10 540,40 550,5 560,45 570,25 600,25"
          />
        </svg>
      </div>

      {/* Logo Section */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-medical-primary to-medical-accent flex items-center justify-center shadow-glow-green animate-heartbeat">
            <Heart className="w-12 h-12 text-white" fill="white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-clinical-accent flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black tracking-wider text-white mb-2">
          CARESYNC <span className="text-medical-accent">AI</span>
        </h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-medical-primary/20 border border-medical-primary/40 px-3 py-1 rounded-full font-bold text-medical-accent tracking-widest">
            PRO
          </span>
          <Shield className="w-4 h-4 text-medical-accent" />
        </div>

        {/* Tagline */}
        <p className="text-sm md:text-base text-slate-400 text-center max-w-md leading-relaxed mb-10">
          AI-Powered Critical Patient Monitoring<br />
          & Response Intelligence
        </p>

        {/* Progress Bar */}
        <div className="w-72 md:w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-medical-primary via-medical-accent to-clinical-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text */}
        <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">
          {statusText}
        </p>
      </div>

      {/* Bottom credits */}
      <div className="absolute bottom-6 text-center">
        <p className="text-[10px] text-slate-600 tracking-widest uppercase">
          Hospital Command Center • Emergency Prediction Intelligence
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
