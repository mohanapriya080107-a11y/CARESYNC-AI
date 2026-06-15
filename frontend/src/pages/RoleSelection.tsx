import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { Stethoscope, HeartPulse, User, Settings, Shield, ChevronRight } from 'lucide-react';

const roles: { role: UserRole; title: string; description: string; access: string; icon: React.ElementType; color: string; gradient: string }[] = [
  {
    role: 'doctor',
    title: 'Doctor',
    description: 'Full patient monitoring, AI copilot, digital twin predictions, and emergency escalation management.',
    access: 'Full Clinical Access',
    icon: Stethoscope,
    color: 'text-clinical-accent',
    gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-400/60',
  },
  {
    role: 'nurse',
    title: 'Nurse',
    description: 'Ward patient monitoring, medication schedules, task management, and critical alert response.',
    access: 'Ward Level Access',
    icon: HeartPulse,
    color: 'text-medical-accent',
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/60',
  },
  {
    role: 'patient',
    title: 'Patient',
    description: 'View personal health status, recovery progress, family updates, and communicate with care team.',
    access: 'Personal Health View',
    icon: User,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 hover:border-purple-400/60',
  },
  {
    role: 'admin',
    title: 'Admin',
    description: 'Hospital-wide analytics, staff management, resource allocation, and system configuration.',
    access: 'Administrator Access',
    icon: Settings,
    color: 'text-clinical-warning',
    gradient: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/60',
  },
];

const routeMap: Record<UserRole, string> = {
  doctor: '/dashboard/doctor',
  nurse: '/dashboard/nurse',
  patient: '/dashboard/family',
  admin: '/dashboard/admin',
};

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectRole } = useAuth();

  const handleSelect = (role: UserRole) => {
    selectRole(role);
    navigate(routeMap[role]);
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-medical-primary/8 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-medical-accent" />
            <span className="text-xs font-bold text-medical-accent uppercase tracking-[0.2em]">Secure Access</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">Select Your Role</h1>
          <p className="text-sm text-slate-400">Choose your access level to enter the Hospital Command Center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            return (
              <button
                key={r.role}
                id={`role-${r.role}`}
                onClick={() => handleSelect(r.role)}
                className={`glass-panel p-6 bg-gradient-to-br ${r.gradient} border text-left group transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-900/60 border border-slate-700/40 flex items-center justify-center ${r.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{r.description}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${r.color} bg-slate-900/40 px-2 py-1 rounded`}>
                  {r.access}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
