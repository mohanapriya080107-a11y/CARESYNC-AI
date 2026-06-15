import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Moon, ShieldCheck } from 'lucide-react';
import { PatientDetailModal } from '../components/PatientDetailModal';

interface SleepRecord {
  patientId: string;
  name: string;
  bed: string;
  sleepStage: 'Deep' | 'Light' | 'REM' | 'Awake';
  respirationRate: number;
  movementIndex: 'Low' | 'Moderate' | 'High';
  fallRisk: 'Low' | 'Elevated';
  lastMovement: string;
}

const NightWatch: React.FC = () => {
  const {
    patients,
    doctors,
    handleAcknowledgeAlert,
    handleFetchCopilot,
    handleFetchFamily,
    selectedPatientId,
    setSelectedPatientId
  } = useData();

  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Map state to sleep records
  const sleepRecords: SleepRecord[] = patients.map((p, idx) => {
    const sleepStages: ('Deep' | 'Light' | 'REM' | 'Awake')[] = ['Deep', 'Light', 'REM', 'Awake'];
    const movements: ('Low' | 'Moderate' | 'High')[] = ['Low', 'Moderate', 'High'];
    
    // Deterministic mock generation based on index
    return {
      patientId: p.id,
      name: p.name,
      bed: p.bed_no,
      sleepStage: sleepStages[idx % sleepStages.length],
      respirationRate: Math.round(p.vitals.respiratory_rate || 14 + (idx % 4)),
      movementIndex: p.risk_category === 'Critical' ? 'Moderate' : movements[idx % movements.length],
      fallRisk: p.risk_score > 60 ? 'Elevated' : 'Low',
      lastMovement: `${3 + (idx * 4)}m ago`
    };
  });

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-400" />
            Night Watch Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">Live sleep telemetry, movement timelines, and rapid fall risk prevention.</p>
        </div>
        <button
          onClick={generateReport}
          disabled={isGenerating}
          className="glass-btn-primary text-xs py-2 px-4 uppercase tracking-wider font-bold"
        >
          {isGenerating ? 'Analyzing Vitals...' : reportGenerated ? 'Report Logged' : 'Compile Night Shift Report'}
        </button>
      </div>

      {reportGenerated && (
        <div className="glass-panel p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Shift compilation complete. Generated analytics logged to chief station nurse.
        </div>
      )}

      {/* Sleep Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sleepRecords.map((record) => (
          <div
            key={record.patientId}
            onClick={() => setSelectedPatientId(record.patientId)}
            className="glass-panel p-5 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <strong className="text-sm text-slate-100 block">{record.name}</strong>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Bed {record.bed} • {record.patientId}</span>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                record.sleepStage === 'Deep' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' :
                record.sleepStage === 'Awake' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                'text-slate-400 border-slate-800 bg-slate-900'
              }`}>
                {record.sleepStage}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-slate-900/60 py-3 text-center">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Respiration</span>
                <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">{record.respirationRate}/m</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Movement</span>
                <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">{record.movementIndex}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Fall Risk</span>
                <span className={`text-xs font-mono font-bold mt-1 block ${
                  record.fallRisk === 'Elevated' ? 'text-orange-400' : 'text-emerald-400'
                }`}>{record.fallRisk}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>Last detected movement</span>
              <span className="font-mono">{record.lastMovement}</span>
            </div>
          </div>
        ))}
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

export default NightWatch;
