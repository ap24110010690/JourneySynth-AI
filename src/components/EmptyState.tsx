// src/components/EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs my-8">
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
