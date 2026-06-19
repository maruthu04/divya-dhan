'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { getAccounts } from '@/actions/accounts';
import { getInvestments } from '@/actions/investments';
import { getLendings, getBorrowings } from '@/actions/debt';
import { getGoals } from '@/actions/goals';
import { Scale, TrendingUp, Building2, Coins, TrendingDown, Wallet, PiggyBank, Lock, Gem, HandCoins, CreditCard, Loader2, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NetWorthPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bankBalance: 0,
    cashBalance: 0,
    savingsBalance: 0,
    lockerBalance: 0,
    investmentsValue: 0,
    goldValue: 0,
    lentMoney: 0,
    goalsSaved: 0,
    borrowings: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    chartData: [] as any[],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [accounts, investments, lendings, borrowings, goals] = await Promise.all([
        getAccounts(),
        getInvestments(),
        getLendings(),
        getBorrowings(),
        getGoals(),
      ]);

      const bankBalance = accounts.filter((a: any) => a.type === 'bank').reduce((s: number, a: any) => s + a.balance, 0);
      const cashBalance = accounts.filter((a: any) => a.type === 'wallet').reduce((s: number, a: any) => s + a.balance, 0);
      const savingsBalance = accounts.filter((a: any) => a.type === 'savings').reduce((s: number, a: any) => s + a.balance, 0);
      const lockerBalance = accounts.filter((a: any) => a.type === 'locker').reduce((s: number, a: any) => s + a.balance, 0);
      const investmentsValue = investments.reduce((s: number, i: any) => s + i.currentValue, 0);
      const goldValue = investments.filter((i: any) => i.type === 'gold').reduce((s: number, i: any) => s + i.currentValue, 0);
      const lentMoney = lendings.reduce((s: number, l: any) => s + l.remainingBalance, 0);
      const goalsSaved = goals.reduce((s: number, g: any) => s + g.currentAmount, 0);
      const totalAssets = bankBalance + cashBalance + savingsBalance + lockerBalance + investmentsValue + lentMoney + goalsSaved;

      const borrowingBal = borrowings.reduce((s: number, b: any) => s + b.remainingBalance, 0);
      const totalLiabilities = borrowingBal;
      const netWorth = totalAssets - totalLiabilities;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mName = months[d.getMonth()];
        chartData.push({
          month: mName,
          value: i === 0 ? netWorth : 0,
        });
      }

      setData({
        bankBalance,
        cashBalance,
        savingsBalance,
        lockerBalance,
        investmentsValue,
        goldValue,
        lentMoney,
        goalsSaved,
        borrowings: borrowingBal,
        totalAssets,
        totalLiabilities,
        netWorth,
        chartData,
      });
    } catch (err) {
      console.error('Failed to load net worth metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const assets = [
    { label: 'Bank Accounts', value: data.bankBalance, icon: Building2, color: '#3B82F6' },
    { label: 'Cash / Wallets', value: data.cashBalance, icon: Wallet, color: '#8B5CF6' },
    { label: 'Savings / FD', value: data.savingsBalance, icon: PiggyBank, color: '#F59E0B' },
    { label: 'Locker Cash', value: data.lockerBalance, icon: Lock, color: '#EC4899' },
    { label: 'Investments', value: data.investmentsValue, icon: TrendingUp, color: '#22C55E' },
    { label: 'Gold', value: data.goldValue, icon: Gem, color: '#EAB308' },
    { label: 'Lent Money', value: data.lentMoney, icon: HandCoins, color: '#F97316' },
    { label: 'Other Savings (Goals)', value: data.goalsSaved, icon: Target, color: '#00C896' },
  ];

  const liabilities = [
    { label: 'Borrowings', value: data.borrowings, icon: CreditCard, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Scale className="w-6 h-6 text-primary" /> Net Worth Engine</h1>
        <p className="text-sm text-text-muted mt-1">Real-time calculation of your total net worth</p>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary/10 via-surface to-ai/5 border border-border rounded-2xl p-8 animate-slide-up text-center">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Net Worth</p>
        <p className="text-4xl md:text-5xl font-bold gradient-text mt-3">{formatCompactCurrency(data.netWorth)}</p>
        <div className="flex items-center justify-center gap-8 mt-4">
          <div>
            <p className="text-xs text-text-muted">Assets</p>
            <p className="text-lg font-bold text-success">{formatCompactCurrency(data.totalAssets)}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-xs text-text-muted">Liabilities</p>
            <p className="text-lg font-bold text-danger">{formatCompactCurrency(data.totalLiabilities)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-sm font-semibold text-text mb-4">Net Worth Over Time</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs><linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00C896" stopOpacity={0.3} /><stop offset="95%" stopColor="#00C896" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => [formatCurrency(v), 'Net Worth']} />
              <Area type="monotone" dataKey="value" stroke="#00C896" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} activeDot={{ r: 5, fill: '#00C896', stroke: '#020617', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets + Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Assets</h3>
            <span className="text-sm font-bold text-success">{formatCompactCurrency(data.totalAssets)}</span>
          </div>
          <div className="space-y-3">
            {assets.map(a => {
              const Icon = a.icon;
              const pct = data.totalAssets > 0 ? (a.value / data.totalAssets) * 100 : 0;
              return (
                <div key={a.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${a.color}15` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                      </div>
                      <span className="text-xs text-text-secondary">{a.label}</span>
                    </div>
                    <span className="text-xs font-medium text-text">{formatCurrency(a.value)}</span>
                  </div>
                  <div className="h-1 bg-background rounded-full overflow-hidden ml-9">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: a.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Liabilities</h3>
            <span className="text-sm font-bold text-danger">{formatCompactCurrency(data.totalLiabilities)}</span>
          </div>
          <div className="space-y-3">
            {liabilities.map(l => {
              const Icon = l.icon;
              return (
                <div key={l.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${l.color}15` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: l.color }} />
                      </div>
                      <span className="text-xs text-text-secondary">{l.label}</span>
                    </div>
                    <span className="text-xs font-medium text-text">{formatCurrency(l.value)}</span>
                  </div>
                  <div className="h-1 bg-background rounded-full overflow-hidden ml-9">
                    <div className="h-full rounded-full bg-danger" style={{ width: data.totalLiabilities > 0 ? '100%' : '0%' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {data.totalLiabilities === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-success font-medium">🎉 No liabilities!</p>
              <p className="text-xs text-text-muted mt-1">You&apos;re debt-free</p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-danger/10 border border-danger/25 rounded-lg">
              <p className="text-xs text-danger font-medium">Debt-to-Asset Ratio</p>
              <p className="text-lg font-bold text-text mt-1">{data.totalAssets > 0 ? ((data.totalLiabilities / data.totalAssets) * 100).toFixed(1) : 0}%</p>
              <p className="text-[10px] text-text-muted mt-1">Below 30% is considered healthy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
