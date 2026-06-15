import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, TrendingDown, Hourglass } from 'lucide-react';

interface DemoScenarioSelectorProps {
  activeScenario: string | null;
  onSelectScenario: (scenario: string) => void;
  isBackendConnected: boolean;
}

export const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({
  activeScenario,
  onSelectScenario,
  isBackendConnected
}) => {
  const scenarios = [
    {
      id: 'stable',
      name: 'Scenario 1: Stable Patient',
      desc: 'Eleanor Thompson in Recovery Ward. Low risk score, stable trends.',
      icon: ShieldCheck,
      color: 'text-clinical-stable border-clinical-stable/20 hover:bg-clinical-stable/5 bg-clinical-stable/5',
      activeColor: 'border-clinical-stable bg-clinical-stable/10 ring-1 ring-clinical-stable',
    },
    {
      id: 'high_risk',
      name: 'Scenario 2: High Risk Patient',
      desc: 'Sofia Martinez in General Ward. AFib arrhythmia, elevated blood pressure.',
      icon: AlertTriangle,
      color: 'text-clinical-warning border-clinical-warning/20 hover:bg-clinical-warning/5 bg-clinical-warning/5',
      activeColor: 'border-clinical-warning bg-clinical-warning/10 ring-1 ring-clinical-warning',
    },
    {
      id: 'critical',
      name: 'Scenario 3: Critical Patient',
      desc: 'Marcus Miller in Emergency Ward. Severe sepsis-induced hypotension.',
      icon: AlertOctagon,
      color: 'text-clinical-highRisk border-clinical-highRisk/20 hover:bg-clinical-highRisk/5 bg-clinical-highRisk/5',
      activeColor: 'border-clinical-highRisk bg-clinical-highRisk/10 ring-1 ring-clinical-highRisk',
    },
    {
      id: 'predicted_emergency',
      name: 'Scenario 4: Predicted Emergency',
      desc: 'Marcus Miller. Near-normal current vitals but Digital Twin predicts respiratory failure in 30m.',
      icon: TrendingDown,
      color: 'text-clinical-accent border-clinical-accent/20 hover:bg-clinical-accent/5 bg-clinical-accent/5',
      activeColor: 'border-clinical-accent bg-clinical-accent/10 ring-1 ring-clinical-accent',
    },
    {
      id: 'escalation',
      name: 'Scenario 5: Escalation Workflow',
      desc: 'Robert Carter in ICU. Critical sepsis. Triggers 30s timeout and paging chain.',
      icon: Hourglass,
      color: 'text-clinical-critical border-clinical-critical/20 hover:bg-clinical-critical/5 bg-clinical-critical/5',
      activeColor: 'border-clinical-critical bg-clinical-critical/10 ring-1 ring-clinical-critical',
    },
  ];

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      {/* Decorative scanner line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-clinical-accent to-transparent opacity-50 animate-pulse"></div>
      
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-clinical-accent" />
          <h2 className="text-lg font-bold font-sans tracking-wide">JUDGE DEMO CONTROLLER</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-clinical-stable shadow-[0_0_8px_#10b981]' : 'bg-clinical-warning shadow-[0_0_8px_#fbbf24]'}`}></span>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {isBackendConnected ? 'Websocket Live' : 'Local Sandbox'}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Select a preset clinical scenario to simulate real-time cardiac & respiratory events, automated triage alerts, and doctor responses.
      </p>

      <div className="flex flex-col gap-2.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`w-full text-left p-3 rounded-xl border flex gap-3 transition-all duration-300 ${isActive ? sc.activeColor : sc.color}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold font-sans tracking-wide uppercase">{sc.name}</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">{sc.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
