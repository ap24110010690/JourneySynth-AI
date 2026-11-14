// src/components/DropoffChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface DropoffChartProps {
  data: { step: string; retained: number; dropped: number; dropRate: number }[];
}

export const DropoffChart: React.FC<DropoffChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No drop-off data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="step" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-800">
                    <p className="font-semibold text-slate-100">{item.step}</p>
                    <p className="text-emerald-400 font-mono mt-1">Retained: {item.retained.toLocaleString()}</p>
                    <p className="text-rose-400 font-mono">Dropped: {item.dropped.toLocaleString()}</p>
                    <p className="text-slate-300 font-mono">Drop Rate: {item.dropRate}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Bar dataKey="retained" name="Retained" fill="#10b981" stackId="a" radius={[0, 0, 4, 4]} barSize={32} />
          <Bar dataKey="dropped" name="Dropped Off" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
