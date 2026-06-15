import React from 'react';
import { Users, ShieldCheck, AlertOctagon, Heart, BellRing, Bed, UserCheck, Activity } from 'lucide-react';
import type { Patient, Doctor, Alert, ExecutiveAnalytics } from '../types';

interface DashboardOverviewProps {
  patients: Patient[];
  doctors: Doctor[];
  alerts: Alert[];
  analytics: ExecutiveAnalytics;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  patients,
  doctors,
  alerts,
  analytics
}) => {
  // Compute counts
  const total = patients.length;
  const critical = patients.filter(p => p.risk_category === "Critical").length;
  const highRisk = patients.filter(p => p.risk_category === "High Risk").length;
  const warning = patients.filter(p => p.risk_category === "Warning").length;
  const stable = patients.filter(p => p.risk_category === "Stable").length;
  
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  
  // Available beds in ICU
  const icuPatients = patients.filter(p => p.ward === "ICU").length;
  const icuCapacity = 20;
  const icuAvailable = Math.max(0, icuCapacity - icuPatients);
  
  const availableDocs = doctors.filter(d => d.status === "Available").length;
  const totalDocs = doctors.length;

  const cards = [
    {
      title: 'TOTAL MONITORED',
      value: total,
      sub: 'Across all wards',
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
      text: 'text-blue-400',
    },
    {
      title: 'STABLE PATIENTS',
      value: stable,
      sub: `${Math.round((stable/total)*100)}% of census`,
      icon: ShieldCheck,
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      text: 'text-clinical-stable',
    },
    {
      title: 'HIGH RISK / WARNING',
      value: highRisk + warning,
      sub: `${highRisk} High, ${warning} Warning`,
      icon: Heart,
      color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      text: 'text-clinical-warning',
    },
    {
      title: 'CRITICAL CASES',
      value: critical,
      sub: 'Immediate action needed',
      icon: AlertOctagon,
      color: critical > 0 
        ? 'from-red-500/30 to-rose-600/30 border-red-500/60 shadow-glow-critical animate-glow-pulse' 
        : 'from-red-500/10 to-rose-500/10 border-red-500/25',
      text: 'text-clinical-critical',
    },
    {
      title: 'ACTIVE ALERTS',
      value: activeAlerts,
      sub: 'Awaiting triage',
      icon: BellRing,
      color: activeAlerts > 0 
        ? 'from-purple-500/20 to-violet-500/20 border-purple-500/50 animate-pulse' 
        : 'from-purple-500/10 to-violet-500/10 border-purple-500/20',
      text: 'text-purple-400',
    },
    {
      title: 'ICU BED CAPACITY',
      value: `${icuAvailable}/20`,
      sub: `${icuPatients} Occupied`,
      icon: Bed,
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
      text: 'text-cyan-400',
    },
    {
      title: 'ON-DUTY MEDICAL STAFF',
      value: `${availableDocs}/${totalDocs}`,
      sub: 'Doctors available',
      icon: UserCheck,
      color: 'from-emerald-500/10 to-teal-500/10 border-slate-700/60',
      text: 'text-slate-300',
    },
    {
      title: 'LIVES SAVED TODAY',
      value: analytics.lives_saved_today,
      sub: 'Pre-emptive assists',
      icon: Activity,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      text: 'text-pink-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`glass-panel p-4 bg-gradient-to-br ${c.color} border flex items-center justify-between transition-all duration-300 hover:scale-[1.02]`}
          >
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 block">{c.title}</span>
              <span className={`text-2xl font-bold font-sans tracking-tight block mt-1.5 ${c.text}`}>
                {c.value}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">{c.sub}</span>
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40 ${c.text}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
