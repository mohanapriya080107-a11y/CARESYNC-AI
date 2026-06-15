import React from 'react';
import { BellRing, CheckCircle, Clock } from 'lucide-react';
import type { Alert } from '../types';

interface AlertCenterProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onAcknowledge,
  onSelectPatient
}) => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-clinical-critical bg-clinical-critical/10 text-clinical-critical shadow-glow-critical';
      case 'HIGH RISK':
        return 'border-clinical-highRisk bg-clinical-highRisk/10 text-clinical-highRisk';
      case 'WARNING':
        return 'border-clinical-warning bg-clinical-warning/10 text-clinical-warning';
      default:
        return 'border-blue-500/20 bg-blue-500/5 text-blue-400';
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000 - timestamp);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-clinical-accent" />
          <h2 className="text-lg font-bold font-sans tracking-wide">SMART ALERT FEED</h2>
        </div>
        <span className="bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-slate-400">
          {activeAlerts.length} Active
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3 flex-shrink-0 leading-relaxed">
        Smart grouping active. Irrelevant alerts suppressed.
      </p>

      {/* Alerts Scroll List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
        {activeAlerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <CheckCircle className="w-8 h-8 text-clinical-stable mb-2" />
            <p className="text-xs text-slate-300 font-bold">All Patient Systems Nominal</p>
            <p className="text-[10px] text-slate-500 mt-1">No active critical triggers detected.</p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all duration-300 ${getSeverityStyle(alert.severity)}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100 hover:underline cursor-pointer" onClick={() => onSelectPatient(alert.patient_id)}>
                      {alert.patient_name}
                    </span>
                    <span className="text-[10px] text-slate-300 opacity-80 uppercase tracking-widest font-semibold">
                      ({alert.ward})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed font-sans font-medium">
                    {alert.message}
                  </p>
                </div>
                <div className="flex-shrink-0 text-slate-400 flex items-center gap-1 text-[9px] font-semibold bg-slate-950/45 px-1.5 py-0.5 rounded">
                  <Clock className="w-2.5 h-2.5" />
                  {getRelativeTime(alert.timestamp)}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 border-t border-slate-700/20 pt-2">
                <button
                  onClick={() => onSelectPatient(alert.patient_id)}
                  className="text-[10px] font-bold text-slate-200 hover:text-white uppercase px-2 py-1 bg-slate-900/60 rounded border border-slate-700/50 hover:bg-slate-900"
                >
                  Inspect
                </button>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-[10px] font-bold text-slate-100 hover:text-white uppercase px-2 py-1 bg-clinical-accent hover:bg-blue-600 rounded shadow-glow-accent transition-colors duration-200"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
