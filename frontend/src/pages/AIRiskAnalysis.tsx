import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';

const AIRiskAnalysis: React.FC = () => {
  const { patients } = useData();
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id || '');

  const patient = patients.find(p => p.id === selectedId);

  if (!patient) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        No patients available for AI Risk Analysis.
      </div>
    );
  }

  // Generate chart data based on vitals history
  const chartData = patient.vitals_history.map((vh, index) => ({
    time: `-${(patient.vitals_history.length - 1 - index) * 3}s`,
    hr: Math.round(vh.heart_rate),
    spo2: Math.round(vh.spo2),
    sys: Math.round(vh.systolic),
  }));

  const shapFactors = Object.entries(patient.contributing_factors || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Patient Selection & Key Stats */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider mb-4">Patient Assessment Profile</h3>
          <label className="text-xs text-slate-400 font-bold block mb-1">Select Patient File</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="glass-input w-full text-xs font-semibold"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                {p.name} ({p.id}) — {p.risk_category} ({Math.round(p.risk_score)}%)
              </option>
            ))}
          </select>

          <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Age / Gender</span>
              <p className="text-sm font-bold text-slate-200">{patient.age} years / {patient.gender}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Bed Allocation</span>
              <p className="text-sm font-bold text-slate-200">{patient.ward} • Bed {patient.bed_no}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Primary Diagnoses</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.existing_conditions.map((c, i) => (
                  <span key={i} className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deterioration Meter */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 flex flex-col items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 self-start mb-4">Probability of Deterioration</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Simple circular progress via inline styles */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={patient.risk_category === 'Critical' ? '#ef4444' : patient.risk_category === 'High Risk' ? '#f97316' : '#10b981'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * patient.risk_score) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white">{Math.round(patient.risk_score)}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block mt-1">Risk Index</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-xs font-bold text-slate-300 block">{patient.risk_category} Status</span>
            <p className="text-[10px] text-slate-400 mt-1 italic">{patient.risk_reason}</p>
          </div>
        </div>
      </div>

      {/* Right panel: Explainable AI contributing factors (SHAP) & Trends */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* SHAP Explainable AI Cards */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Explainable AI (SHAP Contributors)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Relative weight of medical vitals and diagnosed vectors contributing to current risk index.</p>
          
          <div className="space-y-3">
            {shapFactors.map(([factor, weight], idx) => (
              <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">{factor}</span>
                  <span className="font-mono font-bold text-clinical-critical">+{Math.round(weight)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, weight * 2)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {shapFactors.length === 0 && (
              <p className="text-xs text-slate-500 italic">No significant contributors found.</p>
            )}
          </div>
        </div>

        {/* Recharts Vitals Trend */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Vitals Telemetry Trend (Last 60s)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '10px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="hr" stroke="#ef4444" name="Heart Rate" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sys" stroke="#3b82f6" name="Systolic BP" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRiskAnalysis;
