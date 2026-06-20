'use client';

import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import {
  ArrowDownLeft, ArrowUpRight, HandCoins, Handshake,
  CalendarDays, TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface DailyData {
  day: string; // 'Mon', 'Tue', etc.
  date: string; // full date label e.g. 'Jun 16'
  income: number;
  expenses: number;
  borrowings: number;
}

interface WeeklyOverviewProps {
  weeklyIncome: number;
  weeklyExpenses: number;
  weeklyBorrowed: number;
  weeklyLent: number;
  weeklyBorrowedRemaining?: number;
  weeklyLentRemaining?: number;
  dailyBreakdown: DailyData[];
  weekLabel: string; // e.g. "Jun 16 – Jun 22"
  lastWeekIncome: number;
  lastWeekExpenses: number;
}

export default function WeeklyOverview({
  weeklyIncome,
  weeklyExpenses,
  weeklyBorrowed,
  weeklyLent,
  weeklyBorrowedRemaining = 0,
  weeklyLentRemaining = 0,
  dailyBreakdown,
  weekLabel,
  lastWeekIncome,
  lastWeekExpenses,
}: WeeklyOverviewProps) {
  const netWeekly = (weeklyIncome + weeklyBorrowed) - (weeklyExpenses + weeklyLent);

  const incomeChange = lastWeekIncome > 0
    ? Math.round(((weeklyIncome - lastWeekIncome) / lastWeekIncome) * 100)
    : weeklyIncome > 0 ? 100 : 0;

  const expenseChange = lastWeekExpenses > 0
    ? Math.round(((weeklyExpenses - lastWeekExpenses) / lastWeekExpenses) * 100)
    : weeklyExpenses > 0 ? 100 : 0;

  const stats = [
    {
      label: 'Weekly Income',
      value: weeklyIncome,
      icon: <ArrowDownLeft className="w-4 h-4" />,
      color: '#22C55E',
      change: incomeChange,
      changeLabel: 'vs last week',
    },
    {
      label: 'Weekly Expenses',
      value: weeklyExpenses,
      icon: <ArrowUpRight className="w-4 h-4" />,
      color: '#EF4444',
      change: -expenseChange, // Negative change in expenses is good
      changeLabel: 'vs last week',
    },
    {
      label: 'Borrowed',
      value: weeklyBorrowed,
      remaining: weeklyBorrowedRemaining,
      icon: <HandCoins className="w-4 h-4" />,
      color: '#F59E0B',
      change: null,
      changeLabel: '',
    },
    {
      label: 'Lent Out',
      value: weeklyLent,
      remaining: weeklyLentRemaining,
      icon: <Handshake className="w-4 h-4" />,
      color: '#8B5CF6',
      change: null,
      changeLabel: '',
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(34,197,94,0.15))' }}>
            <CalendarDays className="w-4 h-4 text-info" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">This Week</h2>
            <p className="text-[11px] text-text-muted">{weekLabel}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${netWeekly >= 0 ? 'text-success' : 'text-danger'}`}
          style={{ backgroundColor: netWeekly >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {netWeekly >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>Net: {netWeekly >= 0 ? '+' : ''}{formatCompactCurrency(netWeekly)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background border border-border/50 rounded-xl p-3 transition-all hover:border-border-light">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-1 mt-0.5">
              <p className="text-base font-bold tracking-tight" style={{ color: stat.value > 0 ? stat.color : undefined }}>
                {stat.value > 0 ? formatCompactCurrency(stat.value) : '₹0'}
              </p>
              {stat.remaining !== undefined && stat.value > 0 && (
                <span className="text-[10px] text-text-muted font-medium">
                  ({formatCompactCurrency(stat.remaining)} remaining)
                </span>
              )}
            </div>
            {stat.change !== null && stat.value > 0 && (
              <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${stat.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {stat.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                <span className="text-text-muted ml-0.5">{stat.changeLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Daily Breakdown Chart */}
      <div className="px-5 pb-5">
        <div className="bg-background border border-border/50 rounded-xl p-4 w-full min-w-0 overflow-hidden">
          <h3 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">Daily Breakdown</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBreakdown} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  tickFormatter={v => v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}K`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#22C55E" radius={[3, 3, 0, 0]} barSize={14} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={14} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#22C55E' }} />
              <span className="text-[11px] text-text-muted">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-[11px] text-text-muted">Expenses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-text mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
          <span className="text-text-secondary capitalize">{entry.name}:</span>
          <span className="font-medium text-text">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}
