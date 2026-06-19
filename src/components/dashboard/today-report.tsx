'use client';

import { formatCurrency } from '@/lib/formatters';
import { INCOME_SOURCES, EXPENSE_CATEGORIES } from '@/lib/constants';
import {
  ArrowDownLeft, ArrowUpRight, HandCoins, Handshake,
  TrendingUp, TrendingDown, Zap, Clock,
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'borrowing' | 'lending';
  description: string;
  amount: number;
  category: string;
  date: string | Date;
}

interface TodayReportProps {
  todayIncome: number;
  todayExpenses: number;
  todayBorrowed: number;
  todayLent: number;
  todayBorrowedRemaining?: number;
  todayLentRemaining?: number;
  todayTransactions: Transaction[];
}

export default function TodayReport({
  todayIncome,
  todayExpenses,
  todayBorrowed,
  todayLent,
  todayBorrowedRemaining = 0,
  todayLentRemaining = 0,
  todayTransactions,
}: TodayReportProps) {
  const netToday = (todayIncome + todayBorrowed) - (todayExpenses + todayLent);
  const hasActivity = todayIncome > 0 || todayExpenses > 0 || todayBorrowed > 0 || todayLent > 0;

  const stats = [
    {
      label: 'Money In',
      value: todayIncome,
      icon: <ArrowDownLeft className="w-4 h-4" />,
      color: '#22C55E',
      bg: 'rgba(34, 197, 94, 0.1)',
    },
    {
      label: 'Money Out',
      value: todayExpenses,
      icon: <ArrowUpRight className="w-4 h-4" />,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Borrowed',
      value: todayBorrowed,
      remaining: todayBorrowedRemaining,
      icon: <HandCoins className="w-4 h-4" />,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Lent Out',
      value: todayLent,
      remaining: todayLentRemaining,
      icon: <Handshake className="w-4 h-4" />,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  const getTransactionMeta = (tx: Transaction) => {
    if (tx.type === 'income') {
      const src = INCOME_SOURCES.find(s => s.value === tx.category);
      return { color: '#22C55E', label: src?.label || tx.category, sign: '+' };
    }
    if (tx.type === 'expense') {
      const cat = EXPENSE_CATEGORIES.find(c => c.value === tx.category);
      return { color: '#EF4444', label: cat?.label || tx.category, sign: '-' };
    }
    if (tx.type === 'borrowing') {
      return { color: '#F59E0B', label: 'Borrowing', sign: '+' };
    }
    return { color: '#8B5CF6', label: 'Lending', sign: '-' };
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.15))' }}>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Today&apos;s Report</h2>
            <p className="text-[11px] text-text-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        {hasActivity && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${netToday >= 0 ? 'text-success' : 'text-danger'}`}
            style={{ backgroundColor: netToday >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
            {netToday >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>Net: {netToday >= 0 ? '+' : ''}{formatCurrency(netToday)}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative group bg-background border border-border/50 rounded-xl p-3.5 transition-all hover:border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: stat.bg }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-1">
              <p className="text-lg font-bold tracking-tight" style={{ color: stat.value > 0 ? stat.color : undefined }}>
                {stat.value > 0 ? formatCurrency(stat.value) : '₹0'}
              </p>
              {stat.remaining !== undefined && stat.value > 0 && (
                <span className="text-[10px] text-text-muted font-medium">
                  ({formatCurrency(stat.remaining)} remaining)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Transactions */}
      {todayTransactions.length > 0 ? (
        <div className="border-t border-border/50">
          <div className="px-5 py-2.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Today&apos;s Activity</span>
            <span className="text-[11px] text-text-muted ml-auto">{todayTransactions.length} entries</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {todayTransactions.map((tx) => {
              const meta = getTransactionMeta(tx);
              return (
                <div key={tx.id} className="px-5 py-2.5 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                    <div className="min-w-0">
                      <p className="text-sm text-text truncate">{tx.description}</p>
                      <p className="text-[11px] text-text-muted">{meta.label}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0 ml-3" style={{ color: meta.color }}>
                    {meta.sign}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border-t border-border/50 px-5 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-primary-muted mx-auto mb-3 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-text-muted">No transactions yet today</p>
          <p className="text-[11px] text-text-muted mt-0.5">Use the quick-add panel below to start tracking!</p>
        </div>
      )}
    </div>
  );
}
