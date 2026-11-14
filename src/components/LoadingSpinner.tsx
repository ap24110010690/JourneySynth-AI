// src/components/LoadingSpinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading JourneySynth Data...',
  subtext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-xs font-semibold text-slate-700">{message}</p>
      {subtext && <p className="text-[11px] text-slate-400 max-w-xs text-center">{subtext}</p>}
    </div>
  );
};
