import React from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, ShieldCheck, Sparkles, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import type { ExecutiveAnalytics as AnalyticsType } from '../types';

interface ExecutiveAnalyticsProps {
  analytics: AnalyticsType;
}

export const ExecutiveAnalytics: React.FC<ExecutiveAnalyticsProps> = ({ analytics }) => {
  // Mock hourly response time trend
  const responseTimeTrend = [
    { hour: '04:00', time: 5.4 },
    { hour: '05:00', time: 5.1 },
    { hour: '06:00', time: 4.8 },
    { hour: '07:00', time: 4.5 },
    { hour: '08:00', time: 4.2 },
    { hour: '09:00', time: 4.0 },
  ];

  // Mock department accuracy stats
  const accuracyData = [
    { name: 'ICU', accuracy: 96 },
    { name: 'ER', accuracy: 95 },
    { name: 'General', accuracy: 93 },
    { name: 'Recovery', accuracy: 95 },
  ];

  const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="glass-panel p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-1 flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-clinical-accent" />
        <h2 className="text-lg font-bold font-sans tracking-wide">EXECUTIVE OPERATIONS & METRICS</h2>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Response</span>
            <strong className="text-xl font-extrabold text-white block mt-1">{analytics.avg_response_time} min</strong>
            <span className="text-[10px] text-clinical-stable block mt-0.5">-1.2m since 8 AM</span>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-clinical-accent">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Alert Accuracy</span>
            <strong className="text-xl font-extrabold text-white block mt-1">{analytics.alert_accuracy}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">True positive rate</span>
          </div>
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-clinical-stable">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Risk Detections</span>
            <strong className="text-xl font-extrabold text-white block mt-1">{analytics.predicted_emergencies} Cases</strong>
            <span className="text-[10px] text-clinical-warning block mt-0.5">Flagged preemptively</span>
          </div>
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-clinical-warning">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AI Insights</span>
            <strong className="text-xl font-extrabold text-white block mt-1">{analytics.ai_recommendations_generated}</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Protocols structured</span>
          </div>
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Response time curve */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Response Latency Trend (Hourly Avg)
        </span>
        <div className="h-[100px] w-full font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTimeTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[2, 6]} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Area type="monotone" dataKey="time" name="Response Time" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy bars */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Prediction Model Accuracy by Ward (%)
        </span>
        <div className="h-[100px] w-full font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[80, 100]} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]}>
                {accuracyData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lives saved mission statement */}
      <div className="bg-gradient-to-r from-clinical-stable/10 to-teal-500/10 p-3 rounded-lg border border-clinical-stable/20 flex items-center gap-2.5">
        <Activity className="w-5 h-5 text-clinical-stable shrink-0 animate-pulse" />
        <p className="text-[11px] text-slate-300 leading-normal font-sans">
          <strong>Mission Dashboard:</strong> Early deterioration forecasting has lowered average code blue alerts by <strong className="text-white">32%</strong> this month.
        </p>
      </div>

    </div>
  );
};
