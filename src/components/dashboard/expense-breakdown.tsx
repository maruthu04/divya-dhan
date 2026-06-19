'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ExpenseBreakdownProps {
  data: { category?: string; name?: string; amount: number; color: string }[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { category, name, amount, color } = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-text-secondary">{category || name || 'Unknown'}</span>
      </div>
      <p className="text-sm font-semibold text-text mt-1">{formatCurrency(amount)}</p>
    </div>
  );
}

export default function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const top5 = data.slice(0, 5);
  const otherAmount = data.slice(5).reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Expense Breakdown</h3>
          <p className="text-xs text-text-muted mt-0.5">This month</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative w-[160px] h-[160px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                dataKey="amount"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-sm font-bold text-text">₹{(total / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {top5.map((item, index) => {
            const displayName = item.category || item.name || 'Unknown';
            return (
              <div key={displayName + '-' + index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text-secondary truncate">{displayName}</span>
                </div>
                <span className="text-xs font-medium text-text flex-shrink-0">
                  {((item.amount / total) * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
          {otherAmount > 0 && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-text-muted" />
                <span className="text-xs text-text-secondary">Others</span>
              </div>
              <span className="text-xs font-medium text-text">
                {((otherAmount / total) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
