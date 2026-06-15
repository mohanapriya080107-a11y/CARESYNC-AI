import React, { useState, useEffect } from 'react';
import {
  X, Activity, BrainCircuit, Users,
  Clock, MessageSquareCheck, Play, CheckCircle2,
  Hourglass, User
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import type { Patient, Doctor } from '../types';

interface PatientDetailModalProps {
  patient: Patient;
  doctors: Doctor[];
  onClose: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  fetchCopilot: (patientId: string) => Promise<any>;
  fetchFamily: (patientId: string) => Promise<string>;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  doctors,
  onClose,
  fetchCopilot,
  fetchFamily
}) => {
  const [activeTab, setActiveTab] = useState<'spo2' | 'hr' | 'bp'>('spo2');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotData, setCopilotData] = useState<any>(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyText, setFamilyText] = useState<string>('');

  const doctor = doctors.find(d => d.id === patient.assigned_doctor_id);

  useEffect(() => {
    const loadData = async () => {
      setCopilotLoading(true);
      try {
        const copData = await fetchCopilot(patient.id);
        setCopilotData(copData);
      } catch (err) {
        console.error(err);
      } finally {
        setCopilotLoading(false);
      }
    };
    loadData();
    setFamilyText('');
  }, [patient.id]);

  const handleGenerateFamilyUpdate = async () => {
    setFamilyLoading(true);
    try {
      const txt = await fetchFamily(patient.id);
      setFamilyText(txt);
    } catch (err) {
      console.error(err);
      setFamilyText("The patient is resting comfortably and vitals are being monitored closely.");
    } finally {
      setFamilyLoading(false);
    }
  };

  // Build separate historical + prediction chart data arrays
  const buildChartData = () => {
    const historical: any[] = [];
    const predicted: any[] = [];

    // History
    patient.vitals_history.forEach((h, idx) => {
      const label = idx === patient.vitals_history.length - 1 ? 'Now' : `-${20 - idx}m`;
      historical.push({ time: label, spo2: h.spo2, hr: h.heart_rate, sys: h.systolic, dia: h.diastolic });
    });

    // Last history entry doubles as "Now" start for predictions
    const lastHist = historical[historical.length - 1];

    // Predictions
    patient.predictions.forEach((p) => {
      predicted.push({ time: `+${p.minutes_ahead}m`, spo2: p.spo2, hr: p.heart_rate, sys: p.systolic, dia: p.diastolic });
    });

    // Merge: all points combined; historical has values, predictions has only predicted keys
    const allTimes = [
      ...historical.map(h => ({ time: h.time, hist_spo2: h.spo2, hist_hr: h.hr, hist_sys: h.sys, hist_dia: h.dia, pred_spo2: undefined as number | undefined, pred_hr: undefined as number | undefined, pred_sys: undefined as number | undefined, pred_dia: undefined as number | undefined })),
    ];

    // Bridge point – "Now" appears in both series for continuity
    const bridgePoint = {
      time: 'Now',
      hist_spo2: lastHist?.spo2,
      hist_hr: lastHist?.hr,
      hist_sys: lastHist?.sys,
      hist_dia: lastHist?.dia,
      pred_spo2: lastHist?.spo2,
      pred_hr: lastHist?.hr,
      pred_sys: lastHist?.sys,
      pred_dia: lastHist?.dia,
    };

    // Replace last point with bridge
    if (allTimes.length > 0) allTimes[allTimes.length - 1] = bridgePoint;

    predicted.forEach(pr => {
      allTimes.push({
        time: pr.time,
        hist_spo2: undefined, hist_hr: undefined, hist_sys: undefined, hist_dia: undefined,
        pred_spo2: pr.spo2, pred_hr: pr.hr, pred_sys: pr.sys, pred_dia: pr.dia
      });
    });

    return allTimes;
  };

  const chartData = buildChartData();

  const escalationTimer = patient.escalation_timer ?? 0;

  const getEscalationBanner = () => {
    if (patient.escalation_status === 'None') return null;

    let label = '';
    let description = '';
    let bannerStyle = '';

    if (patient.escalation_status === 'Pending') {
      label = 'Clinician Confirm Pending';
      description = `Escalation trigger in ${escalationTimer}s. Attending physician paged.`;
      bannerStyle = 'bg-clinical-critical/20 border-clinical-critical/40 text-clinical-critical animate-pulse shadow-glow-critical';
    } else if (patient.escalation_status === 'Escalated_Senior') {
      label = 'Level 1 Escalation: Senior Staff Notified';
      description = `Timeout reached. Chief of Critical Care paged. Response pending in ${escalationTimer}s.`;
      bannerStyle = 'bg-clinical-highRisk/20 border-clinical-highRisk/40 text-clinical-highRisk';
    } else if (patient.escalation_status === 'Escalated_ICU') {
      label = 'Level 2 Escalation: Wards Broadcast Activated';
      description = `ICU Charge Nurse station alerted. Response pending in ${escalationTimer}s.`;
      bannerStyle = 'bg-clinical-warning/20 border-clinical-warning/40 text-clinical-warning';
    } else {
      label = 'Level 3 Escalation: Code Blue Activated';
      description = 'Critical timeout exceeded. Emergency Crash Cart Team dispatched.';
      bannerStyle = 'bg-red-600/35 border-red-500 text-white shadow-glow-critical';
    }

    return (
      <div className={`p-4 rounded-xl border flex items-center justify-between mb-5 ${bannerStyle}`}>
        <div className="flex items-center gap-3">
          <Hourglass className="w-5 h-5 flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">{label}</div>
            <div className="text-[11px] text-slate-200 mt-1">{description}</div>
          </div>
        </div>
        {patient.escalation_status !== 'Escalated_Emergency' && (
          <div className="text-xl font-black font-mono bg-slate-950/60 px-3 py-1 rounded border border-current">
            00:{escalationTimer < 10 ? `0${escalationTimer}` : escalationTimer}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-6xl max-h-[90vh] overflow-y-auto relative p-6 bg-slate-950/95 border-slate-700/80 animate-slide-up flex flex-col">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors duration-200">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${
                patient.risk_category === 'Critical' ? 'bg-clinical-critical shadow-[0_0_10px_#ef4444] animate-pulse' :
                patient.risk_category === 'High Risk' ? 'bg-clinical-highRisk shadow-[0_0_10px_#f97316]' :
                patient.risk_category === 'Warning' ? 'bg-clinical-warning shadow-[0_0_10px_#fbbf24]' :
                'bg-clinical-stable shadow-[0_0_10px_#10b981]'
              }`}></span>
              <h1 className="text-2xl font-black font-sans tracking-wide text-slate-100 uppercase">{patient.name}</h1>
              <span className="text-sm text-slate-400 font-medium">({patient.id})</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              <div>Age: <strong className="text-slate-200">{patient.age}</strong></div>
              <div>Gender: <strong className="text-slate-200">{patient.gender}</strong></div>
              <div>Ward: <strong className="text-slate-200">{patient.ward}</strong></div>
              <div>Bed: <strong className="text-slate-200">{patient.bed_no}</strong></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Triage Score</span>
              <span className={`text-3xl font-black tracking-tight ${
                patient.risk_category === 'Critical' ? 'text-clinical-critical' :
                patient.risk_category === 'High Risk' ? 'text-clinical-highRisk' :
                patient.risk_category === 'Warning' ? 'text-clinical-warning' : 'text-clinical-stable'
              }`}>{patient.risk_score}%</span>
            </div>
            <div className={`px-3 py-1 border rounded font-black font-sans uppercase tracking-wider text-xs ${
              patient.risk_category === 'Critical' ? 'border-clinical-critical/30 bg-clinical-critical/10 text-clinical-critical' :
              patient.risk_category === 'High Risk' ? 'border-clinical-highRisk/30 bg-clinical-highRisk/10 text-clinical-highRisk' :
              patient.risk_category === 'Warning' ? 'border-clinical-warning/30 bg-clinical-warning/10 text-clinical-warning' :
              'border-clinical-stable/30 bg-clinical-stable/10 text-clinical-stable'
            }`}>{patient.risk_category}</div>
          </div>
        </div>

        {/* Escalation Banner */}
        {getEscalationBanner()}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Charts */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-5">

            {/* Digital Twin Chart */}
            <div className="glass-panel p-5 bg-slate-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-clinical-accent" />
                  <h2 className="text-base font-bold font-sans tracking-wide">DIGITAL TWIN FORECAST MODEL</h2>
                </div>
                <div className="flex gap-1.5">
                  {(['spo2', 'hr', 'bp'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded border transition-all duration-200 ${
                        activeTab === tab ? 'border-clinical-accent bg-clinical-accent text-white' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}>
                      {tab === 'spo2' ? 'SpO₂' : tab === 'hr' ? 'HR' : 'BP'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-clinical-highRisk shadow-[0_0_8px_#f97316] shrink-0 animate-ping"></span>
                <p className="text-[11px] text-slate-300 leading-normal font-sans">
                  <strong>Digital Twin:</strong> Dashed prediction lines begin at "Now". Current value:
                  <strong className="text-white"> {activeTab === 'spo2' ? `${patient.vitals.spo2}%` : activeTab === 'hr' ? `${patient.vitals.heart_rate} bpm` : `${patient.vitals.systolic}/${patient.vitals.diastolic} mmHg`}</strong>.
                  60m forecast: <strong className="text-clinical-accent"> {patient.predictions[2]?.status || 'Stable'}</strong>.
                </p>
              </div>

              <div className="w-full h-[260px] font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10}
                      domain={activeTab === 'spo2' ? [70, 105] : activeTab === 'hr' ? [40, 160] : [70, 180]} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <ReferenceLine x="Now" stroke="#fbbf24" strokeWidth={1.5}
                      label={{ value: 'Now', fill: '#fbbf24', fontSize: 10, position: 'top' }} />

                    {activeTab === 'spo2' && <>
                      <Line type="monotone" dataKey="hist_spo2" name="SpO₂ Historical" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                      <Line type="monotone" dataKey="pred_spo2" name="SpO₂ Predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                    </>}
                    {activeTab === 'hr' && <>
                      <Line type="monotone" dataKey="hist_hr" name="HR Historical" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                      <Line type="monotone" dataKey="pred_hr" name="HR Predicted" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                    </>}
                    {activeTab === 'bp' && <>
                      <Line type="monotone" dataKey="hist_sys" name="Systolic Historical" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                      <Line type="monotone" dataKey="pred_sys" name="Systolic Predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                      <Line type="monotone" dataKey="hist_dia" name="Diastolic Historical" stroke="#60a5fa" strokeWidth={1.5} dot={{ r: 2 }} connectNulls={false} />
                      <Line type="monotone" dataKey="pred_dia" name="Diastolic Predicted" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="6 4" dot={{ r: 2 }} connectNulls={false} />
                    </>}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainable AI Breakdown */}
            <div className="glass-panel p-5 bg-slate-900/40">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-clinical-accent" />
                <h2 className="text-base font-bold font-sans tracking-wide">EXPLAINABLE AI RISK BREAKDOWN</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Positive contributors to the current risk index. Vitals crossing critical thresholds accumulate score weights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(patient.contributing_factors).length === 0 ? (
                  <div className="col-span-2 text-xs text-slate-500 font-medium py-3 text-center">
                    All vital indices are normal. No risk factors accumulated.
                  </div>
                ) : (
                  Object.entries(patient.contributing_factors).map(([factor, weight]) => (
                    <div key={factor} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{factor}</span>
                        <span className="text-clinical-highRisk">+{weight}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 mt-2 border border-slate-800/50">
                        <div
                          className="bg-gradient-to-r from-clinical-warning to-clinical-critical h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (weight / 50) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">

            {/* AI Emergency Copilot */}
            <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/80 to-blue-950/20 border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-clinical-accent">
                <BrainCircuit className="w-28 h-28" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-clinical-accent" />
                  <h2 className="text-base font-black font-sans tracking-wide uppercase">Clinical Copilot</h2>
                </div>
                <span className="bg-clinical-accentGlow px-2 py-0.5 border border-clinical-accent/30 rounded text-[9px] font-black uppercase text-clinical-accent">
                  Decision Support
                </span>
              </div>

              {copilotLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 opacity-60">
                  <span className="w-2 h-2 rounded-full bg-clinical-accent animate-ping"></span>
                  <span className="text-xs text-slate-400 font-bold animate-pulse">Running Clinical Diagnostics...</span>
                </div>
              ) : copilotData ? (
                <div className="flex flex-col gap-3.5">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">LIKELY CONDITION</span>
                    <strong className="text-xs text-white block mt-0.5">{copilotData.likely_condition}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">PROBABLE PATHOPHYSIOLOGY</span>
                    <p className="text-[11px] text-slate-300 mt-1 leading-normal font-sans">{copilotData.probable_cause}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2">SUGGESTED ACTIONS PROTOCOL</span>
                    <div className="flex flex-col gap-2">
                      {copilotData.suggested_actions.map((act: string, aIdx: number) => (
                        <div key={aIdx} className="flex gap-2 items-start text-[11px] leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-clinical-accent/20 border border-clinical-accent/40 flex items-center justify-center text-[9px] font-black text-clinical-accent flex-shrink-0 mt-0.5">
                            {aIdx + 1}
                          </span>
                          <span className="text-slate-200">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-6">No copilot suggestions generated.</div>
              )}
            </div>

            {/* Doctor Assignment */}
            <div className="glass-panel p-4 bg-slate-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-clinical-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Assigned Clinician</h3>
              </div>
              {doctor ? (
                <div className="flex items-center justify-between gap-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs text-slate-100 block">{doctor.name}</strong>
                      <span className="text-[10px] text-slate-400 block">{doctor.department}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider">ETA</span>
                    <strong className="text-xs text-clinical-warning block">{doctor.eta_minutes} Min</strong>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2 text-center border border-dashed border-slate-800 rounded">
                  No clinician assigned.
                </div>
              )}
            </div>

            {/* Family Communication */}
            <div className="glass-panel p-5 bg-slate-900/40">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareCheck className="w-5 h-5 text-clinical-accent" />
                <h2 className="text-base font-bold font-sans tracking-wide">FAMILY UPDATE ENGINE</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Translate critical medical updates into jargon-free family explanations.
              </p>
              {familyLoading ? (
                <div className="py-4 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-clinical-accent rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-clinical-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="text-xs text-slate-400 ml-1">Formulating...</span>
                </div>
              ) : familyText ? (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Generated Explanation</span>
                  <p className="text-[11px] text-slate-300 leading-normal italic font-sans">"{familyText}"</p>
                </div>
              ) : (
                <button onClick={handleGenerateFamilyUpdate}
                  className="w-full text-center py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200">
                  <Play className="w-3.5 h-3.5" />
                  Generate Family Communication
                </button>
              )}
            </div>

            {/* Timeline */}
            <div className="glass-panel p-5 bg-slate-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-clinical-accent" />
                <h2 className="text-base font-bold font-sans tracking-wide">EMERGENCY RESPONSE LOG</h2>
              </div>
              <div className="flex flex-col gap-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-800">
                {patient.timeline.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-2">No event logs recorded.</p>
                ) : (
                  patient.timeline.map((ev, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative pl-1">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 mt-0.5 shrink-0 ${
                        ev.status === 'done'
                          ? 'border-clinical-stable bg-slate-950 text-clinical-stable'
                          : 'border-clinical-critical bg-slate-950 text-clinical-critical animate-pulse shadow-glow-critical'
                      }`}>
                        {ev.status === 'done' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-current"></span>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{ev.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">{ev.description}</div>
                        <span className="text-[9px] text-slate-500 font-semibold font-mono block mt-1">
                          {new Date(ev.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
