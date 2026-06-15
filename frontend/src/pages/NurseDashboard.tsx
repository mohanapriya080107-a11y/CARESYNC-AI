import React from 'react';
import { Users, ClipboardList, Pill, AlertTriangle, Clock, BarChart3 } from 'lucide-react';

const tasks = [
  { id: 1, patient: 'Robert Carter', task: 'Administer IV Antibiotics', time: '10:30 AM', priority: 'HIGH', done: false },
  { id: 2, patient: 'Eleanor Thompson', task: 'Post-op wound check', time: '11:00 AM', priority: 'MEDIUM', done: false },
  { id: 3, patient: 'Marcus Miller', task: 'BiPAP mask adjustment', time: '11:15 AM', priority: 'HIGH', done: false },
  { id: 4, patient: 'Sofia Martinez', task: 'Blood pressure monitoring', time: '11:30 AM', priority: 'MEDIUM', done: true },
  { id: 5, patient: 'John Brown', task: 'Medication schedule review', time: '12:00 PM', priority: 'LOW', done: true },
];

const medications = [
  { patient: 'P101', drug: 'Piperacillin/Tazobactam IV', dose: '4.5g', schedule: 'Every 8h', next: '11:30 AM', status: 'pending' },
  { patient: 'P103', drug: 'Albuterol Nebulizer', dose: '2.5mg', schedule: 'Every 4h', next: '12:00 PM', status: 'pending' },
  { patient: 'P104', drug: 'Metoprolol IV', dose: '5mg', schedule: 'PRN', next: 'As needed', status: 'ready' },
  { patient: 'P102', drug: 'Acetaminophen PO', dose: '500mg', schedule: 'Every 6h', next: '1:00 PM', status: 'scheduled' },
];

const NurseDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-medical-accent" /> Nurse Station
        </h2>
        <p className="text-xs text-slate-400 mt-1">Ward patient management & task coordination</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ward Patients', value: '18', icon: Users, color: 'text-clinical-accent', bg: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
          { label: 'Pending Tasks', value: '3', icon: ClipboardList, color: 'text-clinical-warning', bg: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
          { label: 'Medications Due', value: '4', icon: Pill, color: 'text-purple-400', bg: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
          { label: 'Critical Alerts', value: '2', icon: AlertTriangle, color: 'text-clinical-critical', bg: 'from-red-500/25 to-rose-600/25 border-red-500/50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`glass-panel p-4 bg-gradient-to-br ${s.bg} border flex items-center justify-between hover:scale-[1.02] transition-all`}>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 block">{s.label.toUpperCase()}</span>
                <span className={`text-2xl font-bold mt-1 block ${s.color}`}>{s.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40 ${s.color}`}><Icon className="w-5 h-5" /></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-clinical-warning" /> Task Queue
          </h3>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${t.done ? 'border-slate-800/40 bg-slate-900/30 opacity-60' : 'border-clinical-border bg-slate-900/50 hover:bg-slate-800/50'}`}>
                <input type="checkbox" checked={t.done} readOnly className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-primary" />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${t.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{t.task}</p>
                  <p className="text-[10px] text-slate-500">{t.patient}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'HIGH' ? 'bg-red-500/10 text-clinical-critical' : t.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-clinical-warning' : 'bg-slate-700/50 text-slate-400'}`}>{t.priority}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{t.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medication Schedule */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Pill className="w-4 h-4 text-purple-400" /> Medication Schedule
          </h3>
          <div className="space-y-2">
            {medications.map((m, i) => (
              <div key={i} className="p-3 rounded-xl border border-clinical-border bg-slate-900/50 hover:bg-slate-800/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">{m.drug}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.status === 'pending' ? 'bg-yellow-500/10 text-clinical-warning' : m.status === 'ready' ? 'bg-green-500/10 text-clinical-stable' : 'bg-slate-700/50 text-slate-400'}`}>{m.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{m.patient} • {m.dose} • {m.schedule}</span>
                  <span className="text-[10px] text-slate-500">Next: {m.next}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Analytics */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-medical-accent" /> Shift Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Tasks Completed', value: '12/15', pct: 80 },
            { label: 'Meds Administered', value: '8/11', pct: 73 },
            { label: 'Vitals Recorded', value: '36/40', pct: 90 },
            { label: 'Shift Progress', value: '6h/12h', pct: 50 },
          ].map((m, i) => (
            <div key={i} className="p-3 rounded-xl border border-clinical-border bg-slate-900/40 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-lg font-bold text-white">{m.value}</p>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-medical-primary to-medical-accent rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
