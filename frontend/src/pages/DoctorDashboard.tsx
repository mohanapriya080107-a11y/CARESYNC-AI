import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useData } from '../contexts/DataContext';

// Component imports
import { DashboardOverview } from '../components/DashboardOverview';
import { PatientList } from '../components/PatientList';
import { HospitalHeatmap } from '../components/HospitalHeatmap';
import { AlertCenter } from '../components/AlertCenter';
import { AINurseAssistant } from '../components/AINurseAssistant';
import { DemoScenarioSelector } from '../components/DemoScenarioSelector';
import { ExecutiveAnalytics as ExecutiveAnalyticsPanel } from '../components/ExecutiveAnalytics';
import { PatientDetailModal } from '../components/PatientDetailModal';

const DoctorDashboard: React.FC = () => {
  const {
    patients,
    doctors,
    alerts,
    analytics,
    isBackendConnected,
    activeScenario,
    selectedWard,
    setSelectedWard,
    selectedPatientId,
    setSelectedPatientId,
    handleSelectScenario,
    handleAcknowledgeAlert,
    handleFetchCopilot,
    handleFetchFamily,
    handleSendMessage
  } = useData();

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Stats Cards Dashboard */}
      <DashboardOverview 
        patients={patients} 
        doctors={doctors} 
        alerts={alerts} 
        analytics={analytics} 
      />

      {/* Main Command Center Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Hand Column (Wards and Scenarios) */}
        <div className="col-span-1 flex flex-col gap-6">
          <DemoScenarioSelector 
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            isBackendConnected={isBackendConnected}
          />
          <HospitalHeatmap 
            patients={patients} 
            selectedWard={selectedWard} 
            onSelectWard={setSelectedWard} 
          />
          <AlertCenter 
            alerts={alerts} 
            onAcknowledge={handleAcknowledgeAlert} 
            onSelectPatient={setSelectedPatientId} 
          />
        </div>

        {/* Center Grid Column (Prioritized Queue) */}
        <div className="col-span-1 xl:col-span-2 flex flex-col gap-6">
          <PatientList 
            patients={patients} 
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            selectedWard={selectedWard}
            onSelectWard={setSelectedWard}
          />
          
          {/* Predictive emergency radar overview */}
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/40 to-slate-900/10 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-clinical-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Predictive Emergency Radar</h3>
              </div>
              <span className="bg-clinical-accentGlow border border-clinical-accent/20 px-2 py-0.5 rounded text-[9px] font-black uppercase text-clinical-accent">
                60M Window
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {patients.filter(p => p.risk_score > 45 || p.id === 'P103').slice(0, 2).map((p, idx) => (
                <div key={idx} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-100 block">{p.name}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{p.existing_conditions[0]}</span>
                    <span className="text-[10px] text-slate-505 font-medium block mt-1 font-mono text-slate-400">Bed: {p.bed_no}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Probability</span>
                    <strong className="text-sm text-clinical-critical block mt-0.5">{Math.round(p.risk_score * 0.95)}%</strong>
                    <span className="text-[9px] text-clinical-warning font-semibold block mt-0.5">
                      Within {idx === 0 ? '25' : '35'} Mins
                    </span>
                  </div>
                </div>
              ))}
              {patients.filter(p => p.risk_score > 45 || p.id === 'P103').length === 0 && (
                <p className="col-span-2 text-xs text-slate-500 text-center py-2">No imminent deterioration vectors found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Hand Column (Copilot chat and analytics) */}
        <div className="col-span-1 flex flex-col gap-6">
          <AINurseAssistant onSendMessage={handleSendMessage} />
          <ExecutiveAnalyticsPanel analytics={analytics} />
        </div>
      </div>

      {/* Patient Detail Modal */}
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

export default DoctorDashboard;
