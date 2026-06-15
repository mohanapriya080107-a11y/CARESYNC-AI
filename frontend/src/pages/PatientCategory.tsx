import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

import { PatientDetailModal } from '../components/PatientDetailModal';

const PatientCategory: React.FC = () => {
  const {
    patients,
    doctors,
    handleAcknowledgeAlert,
    handleFetchCopilot,
    handleFetchFamily,
    selectedPatientId,
    setSelectedPatientId
  } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    { label: 'ALL', count: patients.length, color: 'text-slate-400 bg-slate-900 border-slate-800' },
    { label: 'Critical', count: patients.filter(p => p.risk_category === 'Critical').length, color: 'text-red-400 bg-red-950/20 border-red-500/30' },
    { label: 'High Risk', count: patients.filter(p => p.risk_category === 'High Risk').length, color: 'text-orange-400 bg-orange-950/20 border-orange-500/30' },
    { label: 'Warning', count: patients.filter(p => p.risk_category === 'Warning').length, color: 'text-yellow-400 bg-yellow-950/20 border-yellow-500/30' },
    { label: 'Stable', count: patients.filter(p => p.risk_category === 'Stable').length, color: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30' }
  ];

  const filteredPatients = activeCategory === 'ALL'
    ? patients
    : patients.filter(p => p.risk_category === activeCategory);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-2">Patient triage Categorization</h2>
        <p className="text-xs text-slate-400">Triage lists sorted by AI-derived severity, clinical urgency, and monitoring frequency requirements.</p>

        {/* Category count cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {categories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`p-4 rounded-xl border text-left transition-all ${cat.color} ${
                activeCategory === cat.label
                  ? 'ring-2 ring-clinical-accent ring-offset-2 ring-offset-slate-950'
                  : 'hover:opacity-90'
              }`}
            >
              <span className="text-[10px] uppercase font-black tracking-widest block text-slate-400 mb-1">{cat.label}</span>
              <strong className="text-2xl font-black block">{cat.count}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards for Selected Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(p => (
          <div
            key={p.id}
            onClick={() => setSelectedPatientId(p.id)}
            className="glass-panel p-5 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <strong className="text-sm text-slate-100 block">{p.name}</strong>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{p.id} • Bed {p.bed_no}</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                  p.risk_category === 'Critical'
                    ? 'text-red-400 border-red-500/20 bg-red-500/5'
                    : p.risk_category === 'High Risk'
                    ? 'text-orange-400 border-orange-500/20 bg-orange-500/5'
                    : p.risk_category === 'Warning'
                    ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
                    : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                }`}>
                  {p.risk_category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">{p.risk_reason}</p>
            </div>

            <div className="border-t border-slate-900/60 pt-3 mt-3 flex justify-between items-center text-xs">
              <div className="flex gap-3">
                <span className="font-mono text-slate-300 font-semibold">{Math.round(p.vitals.heart_rate)} HR</span>
                <span className="font-mono text-slate-300 font-semibold">{Math.round(p.vitals.spo2)}% SpO₂</span>
              </div>
              <span className="font-mono font-bold text-slate-400 text-[10px]">Rank #{p.priority_rank}</span>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs font-semibold">
            No patients found in this category.
          </div>
        )}
      </div>

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          doctors={doctors}
          onClose={() => setSelectedPatientId(null)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          fetchCopilot={handleFetchCopilot}
          fetchFamily={handleFetchFamily}
        />
      )}
    </div>
  );
};

export default PatientCategory;
