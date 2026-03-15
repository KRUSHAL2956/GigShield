import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Chart({ data, type = 'area', xKey = 'name', yKey = 'value', color = '#4a1d96', height = 250, valueFormatter }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-border p-3 rounded-md shadow-card">
          <p className="text-xs font-semibold text-ink-muted mb-1">{label}</p>
          <p className="text-sm font-bold text-ink flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {valueFormatter ? valueFormatter(payload[0].value) : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorGradient_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eef5" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#6b5f7d', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b5f7d', fontSize: 12 }} tickFormatter={valueFormatter} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e8e5f0', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#colorGradient_${color.replace('#','')})`} activeDot={{ r: 6, strokeWidth: 0, fill: color }} />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eef5" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#6b5f7d', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b5f7d', fontSize: 12 }} tickFormatter={valueFormatter} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0eef5' }} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
