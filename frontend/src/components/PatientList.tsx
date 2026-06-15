import React, { useState } from 'react';
import { Search, Heart, User, ArrowRight } from 'lucide-react';
import type { Patient } from '../types';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  selectedWard: string | null;
  onSelectWard: (ward: string | null) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  selectedWard,
  onSelectWard
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter patients based on search and selected ward
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.existing_conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesWard = selectedWard ? p.ward === selectedWard : true;
    return matchesSearch && matchesWard;
  });

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'Critical':
        return 'text-clinical-critical bg-clinical-critical/10 border-clinical-critical/20';
      case 'High Risk':
        return 'text-clinical-highRisk bg-clinical-highRisk/10 border-clinical-highRisk/20';
      case 'Warning':
        return 'text-clinical-warning bg-clinical-warning/10 border-clinical-warning/20';
      default:
        return 'text-clinical-stable bg-clinical-stable/10 border-clinical-stable/20';
    }
  };

  const getLEDClass = (category: string) => {
    switch (category) {
      case 'Critical': return 'led-red';
      case 'High Risk': return 'led-orange';
      case 'Warning': return 'led-yellow';
      default: return 'led-green';
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-[520px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-clinical-accent" />
          <h2 className="text-lg font-bold font-sans tracking-wide">PATIENT PRIORITY QUEUE</h2>
        </div>
        
        {/* Search & Ward Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or diagnosis..."
              className="glass-input pl-8.5 pr-3 py-1.5 text-xs w-[180px] md:w-[220px]"
            />
          </div>
          
          <select
            value={selectedWard || ''}
            onChange={(e) => onSelectWard(e.target.value ? e.target.value : null)}
            className="glass-input py-1.5 px-2 text-xs bg-slate-950"
          >
            <option value="">All Wards</option>
            <option value="ICU">ICU</option>
            <option value="Emergency Ward">ER</option>
            <option value="General Ward">General</option>
            <option value="Recovery Ward">Recovery</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-y-auto pr-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2.5 pl-2">Rank</th>
              <th className="py-2.5">Patient Details</th>
              <th className="py-2.5">Ward / Bed</th>
              <th className="py-2.5">Real-time Vitals</th>
              <th className="py-2.5">AI Risk Score</th>
              <th className="py-2.5 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                  No patient records matching search parameters.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors duration-150 group hover:bg-slate-900/40 ${
                      isSelected ? 'bg-clinical-accentGlow/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 pl-2 font-bold font-sans text-slate-400">
                      {p.priority_rank}
                    </td>
                    
                    {/* Details */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-clinical-accent">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                            {p.name}
                            <span className="text-[10px] text-slate-500 font-normal">({p.id})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                            {p.existing_conditions[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Ward / Bed */}
                    <td className="py-3">
                      <div className="font-bold text-slate-200">{p.ward}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Bed {p.bed_no}</div>
                    </td>

                    {/* Vitals */}
                    <td className="py-3 font-mono">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                        <div>
                          <span className="text-slate-500">HR: </span>
                          <span className={`font-bold ${p.vitals.heart_rate > 100 || p.vitals.heart_rate < 50 ? 'text-clinical-warning' : 'text-slate-300'}`}>
                            {Math.round(p.vitals.heart_rate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">SpO₂: </span>
                          <span className={`font-bold ${p.vitals.spo2 < 95 ? 'text-clinical-critical' : 'text-slate-300'}`}>
                            {Math.round(p.vitals.spo2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">BP: </span>
                          <span className={`font-bold ${p.vitals.systolic < 90 ? 'text-clinical-critical' : 'text-slate-300'}`}>
                            {Math.round(p.vitals.systolic)}/{Math.round(p.vitals.diastolic)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">RR: </span>
                          <span className="font-bold text-slate-300">
                            {Math.round(p.vitals.respiratory_rate)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={getLEDClass(p.risk_category)}></div>
                        <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(p.risk_category)}`}>
                          {p.risk_score}% {p.risk_category}
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => onSelectPatient(p.id)}
                        className="p-1 px-2.5 rounded bg-slate-900 border border-slate-700/60 hover:bg-clinical-accent hover:border-clinical-accent text-slate-300 hover:text-white transition-all duration-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ml-auto"
                      >
                        Monitor
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
