'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCompactCurrency } from '@/lib/formatters';

interface CashFlowChartProps {
  data: { month: string; income: number; expenses: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary capitalize">{entry.name}:</span>
          <span className="font-medium text-text">{formatCompactCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '350ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Cash Flow</h3>
          <p className="text-xs text-text-muted mt-0.5">Income vs Expenses</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => formatCompactCurrency(v)}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="income" fill="#00C896" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
