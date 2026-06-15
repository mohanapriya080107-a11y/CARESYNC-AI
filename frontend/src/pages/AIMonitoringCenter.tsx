import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, ShieldAlert, Heart, Activity, ArrowUpDown, Filter } from 'lucide-react';
import { PatientDetailModal } from '../components/PatientDetailModal';

const AIMonitoringCenter: React.FC = () => {
  const {
    patients,
    doctors,
    handleAcknowledgeAlert,
    handleFetchCopilot,
    handleFetchFamily,
    selectedPatientId,
    setSelectedPatientId
  } = useData();

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<'risk' | 'name' | 'bed'>('risk');

  const wards = ['All', 'ICU', 'Emergency Ward', 'General Ward', 'Recovery Ward'];
  const risks = ['All', 'Stable', 'Warning', 'High Risk', 'Critical'];

  const filteredPatients = patients
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchesWard = wardFilter === 'All' || p.ward === wardFilter;
      const matchesRisk = riskFilter === 'All' || p.risk_category === riskFilter;
      return matchesSearch && matchesWard && matchesRisk;
    })
    .sort((a, b) => {
      if (sortKey === 'risk') return b.risk_score - a.risk_score;
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return a.bed_no.localeCompare(b.bed_no);
    });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Live AI Patient Monitoring Center</h2>
        <p className="text-xs text-slate-400">Continuous AI scoring, telemetry analysis, and triage optimization across all wards.</p>

        {/* Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search patient or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9 py-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="glass-input w-full py-2 text-xs"
            >
              {wards.map(w => (
                <option key={w} value={w} className="bg-slate-900 text-slate-100">{w === 'All' ? 'All Wards' : w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="glass-input w-full py-2 text-xs"
            >
              {risks.map(r => (
                <option key={r} value={r} className="bg-slate-900 text-slate-100">{r === 'All' ? 'All Risks' : r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="glass-input w-full py-2 text-xs"
            >
              <option value="risk" className="bg-slate-900 text-slate-100">Sort by Risk Score</option>
              <option value="name" className="bg-slate-900 text-slate-100">Sort by Name</option>
              <option value="bed" className="bg-slate-900 text-slate-100">Sort by Bed No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-panel overflow-hidden border border-clinical-border bg-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-950/60">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Ward/Bed</th>
                <th className="py-3 px-4">Vitals Summary</th>
                <th className="py-3 px-4 text-center">Risk Index</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-xs">
              {filteredPatients.map((p) => {
                const getRiskColor = (cat: string) => {
                  if (cat === 'Critical') return 'text-clinical-critical border-red-500/20 bg-red-500/5';
                  if (cat === 'High Risk') return 'text-clinical-highRisk border-orange-500/20 bg-orange-500/5';
                  if (cat === 'Warning') return 'text-clinical-warning border-yellow-500/20 bg-yellow-500/5';
                  return 'text-clinical-stable border-emerald-500/20 bg-emerald-500/5';
                };

                const hr = p.vitals.heart_rate;
                const spo2 = p.vitals.spo2;

                return (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{p.priority_rank}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.gender}, {p.age} yrs • {p.id}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-200">{p.ward}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Bed {p.bed_no}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1.5">
                          <Heart className={`w-3.5 h-3.5 ${hr > 100 || hr < 60 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                          <span className="font-mono font-semibold">{Math.round(hr)} bpm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className={`w-3.5 h-3.5 ${spo2 < 93 ? 'text-orange-400' : 'text-slate-500'}`} />
                          <span className="font-mono font-semibold">{Math.round(spo2)}% O₂</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-black text-sm text-slate-100">{Math.round(p.risk_score)}%</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRiskColor(p.risk_category)}`}>
                        {p.risk_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPatientId(p.id)}
                        className="text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 py-1 px-3.5 rounded-lg transition-all"
                      >
                        Detail File
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs font-semibold">
                    No matching patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default AIMonitoringCenter;
