// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  Compass,
  BarChart3,
  Sparkles,
  Database,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/generate', label: 'Generate Journeys', icon: Cpu },
    { to: '/explorer', label: 'Journey Explorer', icon: Compass },
    { to: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
    { to: '/datasets', label: 'Dataset Management', icon: Database },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Zone */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-xs">
          <Layers className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight">JourneySynth AI</span>
          <span className="text-[11px] text-slate-400">Retail Journey Simulation</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-xs font-bold uppercase">
            {user?.name ? user.name.slice(0, 2) : 'JS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
