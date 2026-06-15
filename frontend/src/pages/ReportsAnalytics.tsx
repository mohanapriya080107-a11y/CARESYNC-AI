import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, BarChart3 } from 'lucide-react';

interface ReportTemplate {
  title: string;
  date: string;
  type: 'Clinical' | 'Resource' | 'Triage';
  size: string;
}

const ReportsAnalytics: React.FC = () => {
  const { analytics } = useData();
  const [exporting, setExporting] = useState<string | null>(null);

  const reports: ReportTemplate[] = [
    { title: 'Daily Incident & Sepsis Audits', date: 'Today, 06:00 AM', type: 'Clinical', size: '2.4 MB' },
    { title: 'Weekly Bed Occupancy & Heatmap Analysis', date: 'Yesterday', type: 'Resource', size: '4.8 MB' },
    { title: 'Monthly AI Predictive Radar Accuracy Audit', date: '01 Jun 2026', type: 'Triage', size: '12.1 MB' }
  ];

  const chartData = [
    { name: '08:00', admissions: 12, discharges: 8 },
    { name: '10:00', admissions: 19, discharges: 14 },
    { name: '12:00', admissions: 15, discharges: 18 },
    { name: '14:00', admissions: 22, discharges: 16 },
    { name: '16:00', admissions: 17, discharges: 20 },
    { name: '18:00', admissions: 25, discharges: 15 }
  ];

  const handleExport = (title: string) => {
    setExporting(title);
    setTimeout(() => {
      setExporting(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Reports compilations list */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Printable Clinical Logs</h3>
          
          <div className="space-y-3">
            {reports.map((rep, idx) => (
              <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div>
                  <strong className="text-xs text-slate-200 block">{rep.title}</strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{rep.date} • {rep.type}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/60 pt-2.5">
                  <span className="text-[10px] text-slate-500 font-mono">{rep.size}</span>
                  <button
                    onClick={() => handleExport(rep.title)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 py-1 px-3 rounded-lg transition-all"
                  >
                    <Download className="w-3 h-3" />
                    {exporting === rep.title ? 'Exporting...' : 'PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick metrics panel */}
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Triage Accuracy Index</h3>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Alert Accuracy</span>
            <strong className="text-lg text-emerald-400">{analytics.alert_accuracy}%</strong>
          </div>
          <div className="flex justify-between items-center border-t border-slate-900/60 pt-3">
            <span className="text-xs text-slate-500">Avg Care Response Time</span>
            <strong className="text-lg text-emerald-400">{analytics.avg_response_time} mins</strong>
          </div>
        </div>
      </div>

      {/* Right panels: Recharts admissions logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Hospital Admission & Discharge Analytics</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Bar dataKey="admissions" fill="#3b82f6" name="Admissions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discharges" fill="#10b981" name="Discharges" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
