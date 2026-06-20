'use client';

import { useState, useEffect } from 'react';
import { getIncomes, addIncome, deleteIncome } from '@/actions/income';
import { INCOME_SOURCES, CHART_COLORS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  ArrowDownLeft, Plus, Search, Filter, Calendar,
  Briefcase, Laptop, Building2, BarChart3, Home,
  Percent, Coins, MoreHorizontal, TrendingUp, X, Trash2, Loader2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const iconMap: Record<string, any> = { Briefcase, Laptop, Building2, BarChart3, Home, Percent, Coins, MoreHorizontal };

export default function IncomePage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('all');

  // Form states
  const [source, setSource] = useState('salary');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getIncomes();
    setIncomes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const res = await addIncome({
      source,
      amount: Number(amount),
      description,
      date,
      recurring,
    });

    if (!res.error) {
      setAmount('');
      setDescription('');
      setRecurring(false);
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      const res = await deleteIncome(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const filteredIncomes = filterSource === 'all'
    ? incomes
    : incomes.filter(i => i.source === filterSource);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const thisMonth = incomes.filter(i => {
    const d = new Date(i.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyTotal = thisMonth.reduce((sum, i) => sum + i.amount, 0);

  // By source data
  const bySource = INCOME_SOURCES.map(s => ({
    name: s.label,
    value: incomes.filter(i => i.source === s.value).reduce((sum, i) => sum + i.amount, 0),
    color: s.color,
  })).filter(s => s.value > 0);

  // Monthly trend (last 6 months dynamically computed)
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = months[d.getMonth()];
    const year = d.getFullYear();

    const mIncomes = incomes.filter((inc: any) => {
      const incDate = new Date(inc.date);
      return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === year;
    });

    const incSum = mIncomes.reduce((sum: number, item: any) => sum + item.amount, 0);

    monthlyData.push({
      month: mName,
      amount: incSum,
    });
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-success" />
            Income Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Track and analyze all your income sources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Income</p>
              <p className="text-2xl font-bold text-success mt-2">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-text-muted mt-1">All time</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(monthlyTotal)}</p>
              <div className="flex items-center gap-1 text-xs text-success mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Active Tracking</span>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Income Sources</p>
              <p className="text-2xl font-bold text-text mt-2">{bySource.length}</p>
              <p className="text-xs text-text-muted mt-1">Active sources</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Trend */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '150ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Monthly Income Trend</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/1000)}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }}
                      labelStyle={{ color: '#F8FAFC' }}
                      formatter={(v: any) => [formatCurrency(v), 'Income']}
                    />
                    <Bar dataKey="amount" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Source */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '200ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Income by Source</h3>
              {bySource.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="w-[160px] h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={bySource} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                          {bySource.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {bySource.map(s => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-xs text-text-secondary">{s.name}</span>
                        </div>
                        <span className="text-xs font-medium text-text">{formatCurrency(s.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-text-muted text-xs">No income records logged yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Filter Bar */}
      <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap items-center gap-2 pb-1 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <button
          onClick={() => setFilterSource('all')}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer',
            filterSource === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover'
          )}
        >
          All
        </button>
        {INCOME_SOURCES.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterSource(s.value)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer',
              filterSource === s.value ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Income Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Source</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map((income) => {
                const sourceMeta = INCOME_SOURCES.find(s => s.value === income.source);
                const Icon = iconMap[sourceMeta?.icon || 'MoreHorizontal'] || MoreHorizontal;
                return (
                  <tr key={income.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sourceMeta?.color}15` }}>
                          <Icon className="w-4 h-4" style={{ color: sourceMeta?.color }} />
                        </div>
                        <span className="text-sm font-medium text-text">{sourceMeta?.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{income.description}</td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{formatDate(income.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-success text-right">+{formatCurrency(income.amount)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredIncomes.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-muted">
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Income</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Source</label>
                <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">
                  {INCOME_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Monthly salary..." className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="recurring" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="rounded border-border bg-background text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer" />
                <label htmlFor="recurring" className="text-xs text-text-secondary font-medium cursor-pointer">This is a recurring monthly income</label>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">
                Add Income
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
