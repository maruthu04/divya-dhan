'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ExpenseBreakdownProps {
  data: { category?: string; name?: string; amount: number; color: string }[];
  monthlyBudget?: number | null;
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

export default function ExpenseBreakdown({ data, monthlyBudget }: ExpenseBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const top4 = data.slice(0, 4);
  const otherAmount = data.slice(4).reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden flex flex-col justify-between" style={{ animationDelay: '400ms' }}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">Expense Breakdown</h3>
            <p className="text-xs text-text-muted mt-0.5">This month</p>
          </div>
        </div>

        {/* Donut Chart - Centered and Styled */}
        <div className="flex justify-center relative py-1">
          <div className="relative w-[150px] h-[150px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
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
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Total Spent</span>
              <span className="text-sm font-bold text-text mt-0.5">₹{(total / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        {/* Detailed Category List with Progress Bars */}
        <div className="space-y-3.5 pt-1">
          {top4.map((item, index) => {
            const displayName = item.category || item.name || 'Unknown';
            const percentage = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <div key={displayName + '-' + index} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary truncate font-medium">{displayName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-text">
                    <span>{formatCurrency(item.amount)}</span>
                    <span className="text-text-muted text-[10px] font-normal">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-border/45 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                </div>
              </div>
            );
          })}
          
          {otherAmount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-text-muted flex-shrink-0" />
                  <span className="text-text-secondary font-medium">Others</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-text">
                  <span>{formatCurrency(otherAmount)}</span>
                  <span className="text-text-muted text-[10px] font-normal">({((otherAmount / total) * 100).toFixed(0)}%)</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-border/45 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-text-muted" style={{ width: `${(otherAmount / total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Limit Progress Section */}
      <div className="mt-5 border-t border-border/50 pt-4 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-secondary font-medium">Monthly Spending Limit</span>
          <span className="font-semibold text-text">
            {monthlyBudget ? (
              `${formatCurrency(total)} / ${formatCurrency(monthlyBudget)}`
            ) : (
              'Limit Not Set'
            )}
          </span>
        </div>
        
        {monthlyBudget ? (
          <>
            <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  total > monthlyBudget ? "bg-danger" : "bg-primary"
                }`}
                style={{ width: `${Math.min((total / monthlyBudget) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-muted">
              <span>{((total / monthlyBudget) * 100).toFixed(0)}% of budget used</span>
              {total > monthlyBudget && (
                <span className="text-danger font-semibold bg-danger/10 px-1.5 py-0.5 rounded">
                  Over budget by {formatCurrency(total - monthlyBudget)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-background/50 rounded-lg border border-border/60">
            <span className="text-[11px] text-text-muted">Configure budget to track limit.</span>
            <a href="/dashboard/settings" className="text-[10px] font-semibold text-primary hover:underline">Set Budget</a>
          </div>
        )}
      </div>
    </div>
  );
}
