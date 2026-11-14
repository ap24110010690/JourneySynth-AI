// src/components/ChannelChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface ChannelChartProps {
  data: { channel: string; eventsCount: number; percentage: number }[];
}

const CHANNEL_COLORS: Record<string, string> = {
  Website: '#4f46e5', // Indigo
  'Mobile App': '#0284c7', // Sky
  Email: '#0d9488', // Teal
  'Paid Ads': '#d97706', // Amber
};

export const ChannelChart: React.FC<ChannelChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No channel data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis
            type="category"
            dataKey="channel"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 500 }}
            width={85}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-800">
                    <p className="font-semibold text-slate-100">{item.channel}</p>
                    <p className="text-slate-300 font-mono mt-1">Interactions: {item.eventsCount.toLocaleString()}</p>
                    <p className="text-indigo-400 font-mono">Share: {item.percentage}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="eventsCount" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.channel}`} fill={CHANNEL_COLORS[entry.channel] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
