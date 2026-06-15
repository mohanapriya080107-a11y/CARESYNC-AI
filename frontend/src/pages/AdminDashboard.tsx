import React from 'react';
import { Users, Stethoscope, HeartPulse, AlertOctagon, Bed, Activity, TrendingUp, ShieldCheck, Brain, Building2, BarChart3 } from 'lucide-react';

const stats = [
  { label: 'Total Patients', value: '247', icon: Users, color: 'text-clinical-accent', bg: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { label: 'Total Doctors', value: '32', icon: Stethoscope, color: 'text-medical-accent', bg: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  { label: 'Total Nurses', value: '68', icon: HeartPulse, color: 'text-purple-400', bg: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
  { label: 'Critical Cases', value: '7', icon: AlertOctagon, color: 'text-clinical-critical', bg: 'from-red-500/25 to-rose-600/25 border-red-500/50 animate-glow-pulse' },
  { label: 'Hospital Occupancy', value: '82%', icon: Building2, color: 'text-clinical-warning', bg: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
  { label: 'ICU Beds Available', value: '4/20', icon: Bed, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30' },
  { label: 'Ventilators', value: '6/12', icon: Activity, color: 'text-pink-400', bg: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  { label: 'Emergency Cases', value: '3', icon: ShieldCheck, color: 'text-orange-400', bg: 'from-orange-500/20 to-amber-500/20 border-orange-500/30' },
];

const recentAlerts = [
  { time: '2 min ago', text: 'Patient P101 - Septic shock vitals deteriorating', severity: 'CRITICAL' },
  { time: '5 min ago', text: 'ICU Bed 12 ventilator maintenance required', severity: 'WARNING' },
  { time: '12 min ago', text: 'Patient P140 discharge approved by Dr. Patel', severity: 'INFO' },
  { time: '18 min ago', text: 'Patient P103 SpO₂ dropped below 90%', severity: 'HIGH RISK' },
  { time: '25 min ago', text: 'Night shift handover completed successfully', severity: 'INFO' },
];

const sevColor: Record<string, string> = {
  CRITICAL: 'text-clinical-critical bg-red-500/10 border-red-500/30',
  'HIGH RISK': 'text-clinical-highRisk bg-orange-500/10 border-orange-500/30',
  WARNING: 'text-clinical-warning bg-yellow-500/10 border-yellow-500/30',
  INFO: 'text-clinical-accent bg-blue-500/10 border-blue-500/30',
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-medical-accent" /> Hospital Command Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">Real-time hospital-wide overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`glass-panel p-4 bg-gradient-to-br ${s.bg} border flex items-center justify-between hover:scale-[1.02] transition-all`}>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 block">{s.label.toUpperCase()}</span>
                <span className={`text-2xl font-bold mt-1 block ${s.color}`}>{s.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart placeholder: Patient Trends */}
        <div className="xl:col-span-2 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-medical-accent" /> Patient Trends
            </h3>
            <span className="text-[10px] text-slate-500">Last 7 Days</span>
          </div>
          <div className="h-48 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-center relative overflow-hidden">
            <BarChart3 className="w-8 h-8 text-slate-700" />
            <p className="text-xs text-slate-600 absolute bottom-3">Live analytics chart</p>
            {/* Animated bars */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 h-36">
              {[60, 45, 80, 55, 70, 90, 65].map((h, i) => (
                <div key={i} className="w-8 bg-gradient-to-t from-medical-primary/60 to-medical-accent/30 rounded-t-md animate-slide-up" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <AlertOctagon className="w-4 h-4 text-clinical-critical" /> Recent Alerts
          </h3>
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {recentAlerts.map((a, i) => (
              <div key={i} className={`p-3 rounded-xl border ${sevColor[a.severity]} flex flex-col gap-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider">{a.severity}</span>
                  <span className="text-[10px] text-slate-500">{a.time}</span>
                </div>
                <p className="text-xs text-slate-300">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Heatmap placeholder */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-medical-accent" /> Hospital Risk Heatmap
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { ward: 'ICU', risk: 78, patients: 20, color: 'bg-clinical-critical/20 border-clinical-critical/40' },
            { ward: 'Emergency', risk: 52, patients: 25, color: 'bg-clinical-highRisk/20 border-clinical-highRisk/40' },
            { ward: 'General', risk: 22, patients: 35, color: 'bg-clinical-stable/20 border-clinical-stable/40' },
            { ward: 'Recovery', risk: 12, patients: 20, color: 'bg-clinical-stable/15 border-clinical-stable/30' },
          ].map((w, i) => (
            <div key={i} className={`p-4 rounded-xl border ${w.color} text-center`}>
              <p className="text-xs font-bold text-slate-300 mb-1">{w.ward}</p>
              <p className="text-2xl font-black text-white">{w.risk}%</p>
              <p className="text-[10px] text-slate-500">{w.patients} patients</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
