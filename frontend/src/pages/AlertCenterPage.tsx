import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const AlertCenterPage: React.FC = () => {
  const { alerts, handleAcknowledgeAlert } = useData();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'HIGH RISK':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
      case 'HIGH RISK':
        return <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">Alert Response Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">Live critical escalation logs, telemetry warnings, and incident reports.</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH RISK', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all ${
                severityFilter === sev
                  ? 'bg-clinical-accent text-white shadow-glow-accent'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts Feed List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel p-5 bg-slate-950/40">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Active Telemetry Incident Log</h3>
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl transition-all flex items-start gap-4 ${
                    alert.acknowledged
                      ? 'bg-slate-900/40 border border-slate-800 text-slate-500'
                      : 'bg-slate-900/80 border border-slate-700/60 text-slate-100 shadow-md'
                  }`}
                >
                  <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    <strong className="text-xs text-slate-200 block">{alert.patient_name} — {alert.ward}</strong>
                    <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 p-1.5 rounded-lg transition-all flex-shrink-0"
                      title="Acknowledge Alert"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No alerts found matching the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alert Policies / Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Escalation Policy Protocol</h3>
            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-red-500 pl-3">
                <strong className="text-slate-200 block mb-0.5">Level 1: Ward Nurse Action</strong>
                <p className="text-slate-400">Immediate bedside validation required. Telemetry alarm auto-clears on confirmation.</p>
              </div>
              <div className="border-l-2 border-orange-500 pl-3">
                <strong className="text-slate-200 block mb-0.5">Level 2: Attending Physician Paged</strong>
                <p className="text-slate-400">Triggered if alert remains unacknowledged for 30s. Automated SMS dispatch initiated.</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-3">
                <strong className="text-slate-200 block mb-0.5">Level 3: Critical Rapid Response</strong>
                <p className="text-slate-400">Escalated to clinical director & code team. Shift-wide overhead broadcast active.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCenterPage;
