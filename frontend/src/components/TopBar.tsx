import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Search, Sun, Moon as MoonIcon } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { user, role } = useAuth();
  const [isDark, setIsDark] = React.useState(true);

  return (
    <header className="h-14 bg-slate-950/70 border-b border-clinical-border flex items-center justify-between px-5 flex-shrink-0 backdrop-blur-sm">
      {/* Left: Title */}
      <div>
        <h1 className="text-sm font-bold text-white">{title}</h1>
        {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-clinical-border rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search patients..."
            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-36"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-clinical-critical rounded-full" />
        </button>

        {/* User badge */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-clinical-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-medical-primary to-clinical-accent flex items-center justify-center text-white text-[10px] font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-200 leading-none">{user?.name}</p>
            <p className="text-[9px] text-slate-500 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
