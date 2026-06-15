import React, { useState } from 'react';
import { Thermometer, Droplets, Wind, Volume2, Activity, Bolt } from 'lucide-react';

interface EnvCard {
  label: string;
  value: string;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  threshold: string;
  color: string;
  icon: React.ElementType;
}

const EnvironmentMonitor: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState('ICU Room 101');

  const rooms = ['ICU Room 101', 'ICU Room 102', 'Emergency Bay A', 'Recovery Ward 201'];

  const roomMetrics: Record<string, EnvCard[]> = {
    'ICU Room 101': [
      { label: 'Temperature', value: '21.8', unit: '°C', status: 'optimal', threshold: '20.0 - 24.0 °C', color: 'text-emerald-400', icon: Thermometer },
      { label: 'Humidity', value: '48.5', unit: '%', status: 'optimal', threshold: '40.0 - 60.0 %', color: 'text-emerald-400', icon: Droplets },
      { label: 'Air Quality (PM2.5)', value: '8.4', unit: 'µg/m³', status: 'optimal', threshold: '< 12.0 µg/m³', color: 'text-emerald-400', icon: Wind },
      { label: 'Ambient Sound', value: '38.2', unit: 'dB', status: 'optimal', threshold: '< 45.0 dB', color: 'text-emerald-400', icon: Volume2 },
      { label: 'Particulate Matter', value: '15.2', unit: 'AQI', status: 'optimal', threshold: '< 50 AQI', color: 'text-emerald-400', icon: Activity },
      { label: 'Emergency Backup Power', value: '100', unit: '% Ready', status: 'optimal', threshold: '> 90% Ready', color: 'text-emerald-400', icon: Bolt }
    ],
    'ICU Room 102': [
      { label: 'Temperature', value: '25.2', unit: '°C', status: 'warning', threshold: '20.0 - 24.0 °C', color: 'text-yellow-400', icon: Thermometer },
      { label: 'Humidity', value: '62.1', unit: '%', status: 'warning', threshold: '40.0 - 60.0 %', color: 'text-yellow-400', icon: Droplets },
      { label: 'Air Quality (PM2.5)', value: '10.2', unit: 'µg/m³', status: 'optimal', threshold: '< 12.0 µg/m³', color: 'text-emerald-400', icon: Wind },
      { label: 'Ambient Sound', value: '52.4', unit: 'warning', status: 'warning', threshold: '< 45.0 dB', color: 'text-yellow-400', icon: Volume2 },
      { label: 'Particulate Matter', value: '22.0', unit: 'AQI', status: 'optimal', threshold: '< 50 AQI', color: 'text-emerald-400', icon: Activity },
      { label: 'Emergency Backup Power', value: '98', unit: '% Ready', status: 'optimal', threshold: '> 90% Ready', color: 'text-emerald-400', icon: Bolt }
    ],
    'Emergency Bay A': [
      { label: 'Temperature', value: '20.5', unit: '°C', status: 'optimal', threshold: '20.0 - 24.0 °C', color: 'text-emerald-400', icon: Thermometer },
      { label: 'Humidity', value: '44.0', unit: '%', status: 'optimal', threshold: '40.0 - 60.0 %', color: 'text-emerald-400', icon: Droplets },
      { label: 'Air Quality (PM2.5)', value: '14.8', unit: 'µg/m³', status: 'warning', threshold: '< 12.0 µg/m³', color: 'text-yellow-400', icon: Wind },
      { label: 'Ambient Sound', value: '61.5', unit: 'dB', status: 'warning', threshold: '< 45.0 dB', color: 'text-yellow-400', icon: Volume2 },
      { label: 'Particulate Matter', value: '38.4', unit: 'AQI', status: 'optimal', threshold: '< 50 AQI', color: 'text-emerald-400', icon: Activity },
      { label: 'Emergency Backup Power', value: '100', unit: '% Ready', status: 'optimal', threshold: '> 90% Ready', color: 'text-emerald-400', icon: Bolt }
    ],
    'Recovery Ward 201': [
      { label: 'Temperature', value: '22.1', unit: '°C', status: 'optimal', threshold: '20.0 - 24.0 °C', color: 'text-emerald-400', icon: Thermometer },
      { label: 'Humidity', value: '49.8', unit: '%', status: 'optimal', threshold: '40.0 - 60.0 %', color: 'text-emerald-400', icon: Droplets },
      { label: 'Air Quality (PM2.5)', value: '7.1', unit: 'µg/m³', status: 'optimal', threshold: '< 12.0 µg/m³', color: 'text-emerald-400', icon: Wind },
      { label: 'Ambient Sound', value: '34.5', unit: 'dB', status: 'optimal', threshold: '< 45.0 dB', color: 'text-emerald-400', icon: Volume2 },
      { label: 'Particulate Matter', value: '12.2', unit: 'AQI', status: 'optimal', threshold: '< 50 AQI', color: 'text-emerald-400', icon: Activity },
      { label: 'Emergency Backup Power', value: '100', unit: '% Ready', status: 'optimal', threshold: '> 90% Ready', color: 'text-emerald-400', icon: Bolt }
    ]
  };

  const cards = roomMetrics[selectedRoom] || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">Hospital Ward Environment telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time HVAC, clean room particulate, and power grid diagnostics.</p>
        </div>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="glass-input text-xs font-semibold py-2 px-4 bg-slate-900 border border-slate-800"
        >
          {rooms.map(r => (
            <option key={r} value={r} className="bg-slate-900 text-slate-100">{r}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 bg-slate-950/40 flex flex-col justify-between min-h-[140px] border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="my-3">
                <span className="text-2xl font-black text-slate-100">{card.value}</span>
                <span className="text-sm font-semibold text-slate-400 ml-1">{card.unit}</span>
              </div>
              <div className="border-t border-slate-900/60 pt-2 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500">Threshold: {card.threshold}</span>
                <span className={`uppercase tracking-wider ${
                  card.status === 'optimal' ? 'text-emerald-400' : 'text-yellow-500'
                }`}>
                  {card.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnvironmentMonitor;
