// src/components/TopHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Dataset } from '../types/frontend';
import { Plus, Database, ChevronRight } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  datasets?: Dataset[];
  selectedDatasetId?: string;
  onSelectDataset?: (id: string) => void;
  actions?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  datasets = [],
  selectedDatasetId,
  onSelectDataset,
  actions,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">JourneySynth</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <h1 className="text-sm font-bold text-slate-900 truncate">{title}</h1>
        {subtitle && (
          <span className="hidden lg:inline text-xs text-slate-400 font-normal truncate">
            — {subtitle}
          </span>
        )}
      </div>

      {/* Right: Actions & Dataset Selector */}
      <div className="flex items-center gap-3 shrink-0">
        {datasets.length > 0 && onSelectDataset && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 hidden sm:inline">Active Dataset:</span>
            <select
              value={selectedDatasetId || ''}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer pr-1"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.dataset_name} ({d.total_customers} cust)
                </option>
              ))}
            </select>
          </div>
        )}

        {actions}

        <Link
          to="/generate"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Simulation</span>
        </Link>
      </div>
    </header>
  );
};
