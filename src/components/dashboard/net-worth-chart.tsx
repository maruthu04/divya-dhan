'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactCurrency } from '@/lib/formatters';

interface NetWorthChartProps {
  data: { month: string; value: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-text">{formatCompactCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function NetWorthChart({ data }: NetWorthChartProps) {
  const displayData = data.map(d => ({
    ...d,
    month: d.month.split('-')[1] ? new Date(d.month + '-01').toLocaleDateString('en-IN', { month: 'short' }) : d.month,
  }));

  // Compute actual % change from first non-zero value to the latest
  const nonZeroValues = data.filter(d => d.value !== 0);
  const firstVal = nonZeroValues.length > 1 ? nonZeroValues[0].value : 0;
  const lastVal = nonZeroValues.length > 0 ? nonZeroValues[nonZeroValues.length - 1].value : 0;
  const pctChange = firstVal > 0 ? Number((((lastVal - firstVal) / firstVal) * 100).toFixed(1)) : 0;

  const changeColor = pctChange > 0 ? 'text-success bg-success-muted' : pctChange < 0 ? 'text-danger bg-danger-muted' : 'text-text-muted bg-surface-hover';

  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Net Worth Trend</h3>
          <p className="text-xs text-text-muted mt-0.5">Last 12 months</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${changeColor}`}>
          <span>{pctChange >= 0 ? '+' : ''}{pctChange}%</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00C896"
              strokeWidth={2.5}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#00C896', stroke: '#020617', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
