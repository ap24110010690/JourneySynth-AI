// src/components/ConversionChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface ConversionChartProps {
  data: { stage: string; count: number; dropoffPercent: number }[];
}

const STAGE_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#10b981'];

export const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No funnel data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="stage"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#475569' }}
            interval={0}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-800">
                    <p className="font-semibold text-slate-100">{item.stage}</p>
                    <p className="text-slate-300 font-mono mt-1">Sessions: {item.count.toLocaleString()}</p>
                    {item.dropoffPercent > 0 && (
                      <p className="text-rose-400 font-mono">Stage Drop-off: {item.dropoffPercent}%</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((_, index) => (
              <Cell key={`funnel-cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
