import React from 'react';
import { LayoutGrid } from 'lucide-react';
import type { Patient } from '../types';

interface HospitalHeatmapProps {
  patients: Patient[];
  selectedWard: string | null;
  onSelectWard: (ward: string | null) => void;
}

export const HospitalHeatmap: React.FC<HospitalHeatmapProps> = ({
  patients,
  selectedWard,
  onSelectWard
}) => {
  const wards = [
    { id: 'ICU', name: 'Intensive Care Unit (ICU)', color: 'bg-indigo-500', gridArea: 'col-span-2 row-span-2' },
    { id: 'Emergency Ward', name: 'Emergency Ward (ER)', color: 'bg-red-500', gridArea: 'col-span-2 row-span-1' },
    { id: 'General Ward', name: 'General Ward (GW)', color: 'bg-emerald-500', gridArea: 'col-span-1 row-span-2' },
    { id: 'Recovery Ward', name: 'Recovery Ward (REC)', color: 'bg-teal-500', gridArea: 'col-span-1 row-span-2' }
  ];

  const getWardStats = (wardId: string) => {
    const wardPatients = patients.filter(p => p.ward === wardId);
    const count = wardPatients.length;
    if (count === 0) return { avgRisk: 0, status: 'Empty', colorClass: 'border-slate-800 text-slate-500', bgClass: 'bg-slate-900/20' };

    const avgRisk = wardPatients.reduce((sum, p) => sum + p.risk_score, 0) / count;
    
    let status = 'Safe';
    let colorClass = 'border-clinical-stable text-clinical-stable';
    let bgClass = 'bg-clinical-stable/10 hover:bg-clinical-stable/15';

    if (avgRisk >= 65) {
      status = 'Critical';
      colorClass = 'border-clinical-critical text-clinical-critical shadow-glow-critical animate-pulse';
      bgClass = 'bg-clinical-critical/15 hover:bg-clinical-critical/20';
    } else if (avgRisk >= 40) {
      status = 'High Alert';
      colorClass = 'border-clinical-warning text-clinical-warning';
      bgClass = 'bg-clinical-warning/10 hover:bg-clinical-warning/15';
    } else if (avgRisk >= 20) {
      status = 'Observation';
      colorClass = 'border-blue-400 text-blue-400';
      bgClass = 'bg-blue-500/10 hover:bg-blue-500/15';
    }

    return {
      avgRisk: Math.round(avgRisk),
      count,
      status,
      colorClass,
      bgClass
    };
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-clinical-accent" />
          <h2 className="text-lg font-bold font-sans tracking-wide">HOSPITAL HEATMAP</h2>
        </div>
        {selectedWard && (
          <button
            onClick={() => onSelectWard(null)}
            className="text-[10px] uppercase font-bold text-clinical-accent hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Risk density floor map. Click a ward block to isolate clinical feeds.
      </p>

      {/* Map Layout */}
      <div className="grid grid-cols-2 gap-3 aspect-[4/3] w-full">
        {wards.map((ward) => {
          const stats = getWardStats(ward.id);
          const isSelected = selectedWard === ward.id;
          
          return (
            <button
              key={ward.id}
              onClick={() => onSelectWard(isSelected ? null : ward.id)}
              className={`text-left p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${stats.bgClass} ${stats.colorClass} ${
                isSelected 
                  ? 'ring-2 ring-clinical-accent border-clinical-accent bg-slate-900/65 scale-[0.99] shadow-glow-accent' 
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-slate-300 truncate uppercase">
                    {ward.id === 'ICU' ? 'ICU' : ward.id === 'Emergency Ward' ? 'ER' : ward.id === 'General Ward' ? 'GW' : 'REC'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Beds:</span>
                    <span className="text-[10px] font-bold text-slate-200">{stats.count || 0}</span>
                  </div>
                </div>
                
                <h3 className="text-xs font-bold text-slate-100 mt-2 truncate max-w-[120px]">
                  {ward.name.split(' ')[0]} {ward.name.split(' ')[1] || ''}
                </h3>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Risk Index</span>
                  <span className="text-lg font-extrabold tracking-tight text-slate-100">
                    {stats.avgRisk}%
                  </span>
                </div>
                
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-current bg-slate-950/40`}>
                  {stats.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-800/80">
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-clinical-stable"></span>
            <span>Stable (&lt;20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Obs (20-40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-clinical-warning"></span>
            <span>Alert (40-65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-clinical-critical animate-pulse"></span>
            <span>Critical (&gt;65%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
