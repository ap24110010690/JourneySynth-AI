// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Database,
  Cpu,
  CheckCircle2,
  Server,
  Layers,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Account & System Settings"
          subtitle="Manage user credentials, simulation engine settings, and database configurations"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings preferences updated successfully.</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">User Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || ''}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Database & Architecture Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Relational Database Architecture</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">Database Engine</span>
                    <span className="text-slate-500">ACID Relational Storage with Foreign Key Constraints</span>
                  </div>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Active & Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">MySQL Schema Compatibility</span>
                    <span className="text-slate-500">Provided in backend/schema.sql for production migrations</span>
                  </div>
                </div>
                <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Engine Configuration</h3>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed">
                JourneySynth AI integrates the official <strong>@google/genai</strong> SDK on the backend server.
                The Gemini model performs qualitative behavioural drop-off diagnosis and synthetic persona interpretation.
              </p>
              <p className="text-slate-500">
                API keys are kept strictly in backend environment variables and are never sent or exposed to client browsers.
                When the API key is not present, the system automatically falls back to deterministic statistical analysis.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
