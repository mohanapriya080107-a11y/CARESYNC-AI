import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { ShieldCheck, Info } from 'lucide-react';

const FamilyView: React.FC = () => {
  const { patients, handleFetchFamily } = useData();
  const [patientId, setPatientId] = useState<string>('P101');
  const [familyUpdate, setFamilyUpdate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const patient = patients.find(p => p.id === patientId) || patients[0];

  useEffect(() => {
    if (!patient) return;
    const loadFamilyUpdate = async () => {
      setLoading(true);
      const text = await handleFetchFamily(patient.id);
      setFamilyUpdate(text);
      setLoading(false);
    };
    loadFamilyUpdate();
  }, [patientId, patient]);

  if (!patient) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        No active patient files available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Patient Selection & Simplified Status */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Select Family Member</h3>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="glass-input w-full text-xs font-semibold"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Simplified Status Card */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Resting Comfortably</h3>
          <p className="text-xs text-slate-400 mt-1.5">Attending clinical team reports stable parameters.</p>
          
          <div className="w-full border-t border-slate-900/80 pt-4 mt-4 text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Location</span>
              <strong className="text-slate-300">{patient.ward} • Bed {patient.bed_no}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Care Team Contact</span>
              <strong className="text-slate-300">Station Nurse Wing A</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Center + Right: AI generated explanation & recovery tracker */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* AI translation update */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Patient Recovery Status Summary</h3>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block mb-2">AI-Generated Plain Language Explanation</span>
            {loading ? (
              <p className="text-xs text-slate-400 italic">Translating clinical parameters into plain text...</p>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{familyUpdate}</p>
            )}
          </div>
        </div>

        {/* Recovery progress bar */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Recovery Milestones</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Progress to Discharge Ready</span>
                <span className="font-mono text-emerald-400">75%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 block">Surgical Post-Op</span>
                <strong className="text-emerald-400 block mt-1">Complete</strong>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 block">Ambulation Status</span>
                <strong className="text-emerald-400 block mt-1">Independent</strong>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 block">Pain Management</span>
                <strong className="text-yellow-500 block mt-1">Titrating</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyView;
