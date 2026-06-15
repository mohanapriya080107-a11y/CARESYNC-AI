import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Heart, LayoutDashboard, Users, AlertTriangle, Camera,
  Mic, Hand, Smile, Thermometer, Building2,
  Tags, Moon, Home, Settings, FileText, ShieldAlert, Stethoscope,
  ChevronLeft, ChevronRight, LogOut, Monitor
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { path: '/dashboard/doctor', label: 'Doctor Dashboard', icon: Stethoscope, roles: ['doctor'] },
  { path: '/dashboard/nurse', label: 'Nurse Dashboard', icon: Users, roles: ['nurse'] },
  { path: '/dashboard/family', label: 'Family View', icon: Home, roles: ['patient'] },
  { path: '/monitoring/camera', label: 'Camera Monitoring', icon: Camera, roles: ['admin', 'doctor', 'nurse'], badge: 'CV' },
  { path: '/monitoring/center', label: 'AI Monitoring', icon: Monitor, roles: ['admin', 'doctor', 'nurse'] },
  { path: '/monitoring/risk', label: 'Risk Analysis', icon: ShieldAlert, roles: ['admin', 'doctor'] },
  { path: '/monitoring/alerts', label: 'Alert Center', icon: AlertTriangle, roles: ['admin', 'doctor', 'nurse'] },
  { path: '/ai/voice', label: 'Voice Assistant', icon: Mic, roles: ['admin', 'doctor', 'nurse'], badge: 'AI' },
  { path: '/ai/handsign', label: 'Hand Sign Detection', icon: Hand, roles: ['admin', 'doctor', 'nurse'], badge: 'CV' },
  { path: '/ai/emotion', label: 'Emotion Detection', icon: Smile, roles: ['admin', 'doctor', 'nurse'], badge: 'CV' },
  { path: '/environment', label: 'Environment', icon: Thermometer, roles: ['admin', 'nurse'] },
  { path: '/room-recommend', label: 'Room AI', icon: Building2, roles: ['admin', 'doctor'] },
  { path: '/categories', label: 'Patient Categories', icon: Tags, roles: ['admin', 'doctor', 'nurse'] },
  { path: '/nightwatch', label: 'Night Watch', icon: Moon, roles: ['admin', 'nurse'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'doctor'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'doctor', 'nurse', 'patient'] },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const filtered = navItems.filter(item => role && item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-60'} h-screen bg-slate-950/90 border-r border-clinical-border flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-clinical-border flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-medical-primary to-medical-accent flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-sm font-black text-white tracking-wider">CARESYNC</span>
            <span className="text-xs text-medical-accent font-bold ml-1">AI</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filtered.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'bg-medical-primary/15 text-medical-accent border border-medical-primary/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[9px] font-bold bg-clinical-accent/20 text-clinical-accent px-1.5 py-0.5 rounded tracking-wider">
                  {item.badge}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-2 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User + Logout */}
      <div className="p-3 border-t border-clinical-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-medical-primary to-clinical-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
