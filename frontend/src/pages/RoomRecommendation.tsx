import React, { useState } from 'react';
import { Building2, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';

interface Recommendation {
  ward: string;
  bed: string;
  confidence: number;
  rationale: string[];
  occupancy: number;
}

const RoomRecommendation: React.FC = () => {
  const [condition, setCondition] = useState('Sepsis Response Protocol');
  const [severity, setSeverity] = useState('Critical');
  const [needs, setNeeds] = useState('Continuous Telemetry');

  const [recommendation, setRecommendation] = useState<Recommendation | null>({
    ward: 'ICU (Intensive Care Unit)',
    bed: 'Bed 102 - Room A',
    confidence: 96.4,
    rationale: [
      'Condition requires level-3 continuous biometric telemetry monitoring.',
      'Active septic shock protocol aligns with ICU response speeds.',
      'Ventilator access is pre-routed and available at Bed 102.'
    ],
    occupancy: 75
  });

  const handleRunAI = () => {
    // Mock updating recommendations
    if (severity === 'Stable') {
      setRecommendation({
        ward: 'General Ward - Wing B',
        bed: 'Bed 304 - Room F',
        confidence: 91.2,
        rationale: [
          'Stable vitals drift aligns with standard shift-check guidelines.',
          'Wing B has low ambient noise, supporting rest & recovery.',
          'Specialist assignment requires general physician round coverage.'
        ],
        occupancy: 60
      });
    } else if (severity === 'High Risk') {
      setRecommendation({
        ward: 'Emergency Ward - Bay C',
        bed: 'Bay C-4',
        confidence: 94.8,
        rationale: [
          'High Risk telemetry flags suggest immediate access to crash cart routing.',
          'Bedside diagnostics availability at Bay C is optimal.',
          'Dr. Vance is currently assigned to general Emergency routing.'
        ],
        occupancy: 85
      });
    } else {
      setRecommendation({
        ward: 'ICU (Intensive Care Unit)',
        bed: 'Bed 102 - Room A',
        confidence: 96.4,
        rationale: [
          'Condition requires level-3 continuous biometric telemetry monitoring.',
          'Active septic shock protocol aligns with ICU response speeds.',
          'Ventilator access is pre-routed and available at Bed 102.'
        ],
        occupancy: 75
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Patient allocation</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Primary Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="glass-input w-full text-xs font-semibold"
              >
                <option value="Sepsis Response Protocol" className="bg-slate-900">Sepsis Response Protocol</option>
                <option value="Hip Post-Op Care" className="bg-slate-900">Hip Post-Op Care</option>
                <option value="COPD Exacerbation" className="bg-slate-900">COPD Exacerbation</option>
                <option value="Cardiac Telemetry Monitor" className="bg-slate-900">Cardiac Telemetry Monitor</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Risk Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="glass-input w-full text-xs font-semibold"
              >
                <option value="Stable" className="bg-slate-900">Stable</option>
                <option value="Warning" className="bg-slate-900">Warning</option>
                <option value="High Risk" className="bg-slate-900">High Risk</option>
                <option value="Critical" className="bg-slate-900">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Special Needs</label>
              <select
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                className="glass-input w-full text-xs font-semibold"
              >
                <option value="Continuous Telemetry" className="bg-slate-900">Continuous Telemetry</option>
                <option value="Isolation Protocol" className="bg-slate-900">Isolation Protocol</option>
                <option value="Ventilator Required" className="bg-slate-900">Ventilator Required</option>
              </select>
            </div>

            <button
              onClick={handleRunAI}
              className="w-full glass-btn-primary flex items-center justify-center gap-2 mt-2 text-xs py-2.5 font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              Recommend allocation
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel Columns */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {recommendation ? (
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">AI Recommendation Engine</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {recommendation.confidence}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Recommended Destination</span>
                <strong className="text-lg text-slate-100 mt-1 block">{recommendation.ward}</strong>
                <span className="text-xs text-medical-accent font-semibold mt-0.5 block">{recommendation.bed}</span>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Destination Occupancy</span>
                <strong className="text-lg text-slate-100 mt-1 block">{recommendation.occupancy}% Occupied</strong>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-clinical-accent h-full rounded-full" style={{ width: `${recommendation.occupancy}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-2.5">Clinical Rationale</h4>
              <ul className="space-y-2 text-xs">
                {recommendation.rationale.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 text-center text-slate-500 text-xs font-semibold flex items-center justify-center min-h-[300px]">
            <HelpCircle className="w-8 h-8 text-slate-600 mb-2 block mx-auto" />
            Select parameters and run AI to fetch recommendation.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomRecommendation;
