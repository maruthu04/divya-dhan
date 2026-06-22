'use client';

import { useState, useEffect } from 'react';
import { addExpense, deleteExpense } from '@/actions/expenses';
import { useData } from '@/components/dashboard/data-provider';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight, Plus, TrendingDown, TrendingUp, X, Trash2, Loader2,
  UtensilsCrossed, ShoppingBag, Plane, Receipt, Heart,
  GraduationCap, Gamepad2, Home, ShoppingCart, Car, Zap, MoreHorizontal,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const iconMap: Record<string, any> = { UtensilsCrossed, ShoppingBag, Plane, Receipt, Heart, GraduationCap, Gamepad2, Home, ShoppingCart, Car, Zap, MoreHorizontal, TrendingUp };

export default function ExpensesPage() {
  const { expenses, loading, refetch: loadData } = useData();
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const res = await addExpense({
      category,
      amount: Number(amount),
      description,
      merchant,
      date,
    });

    if (!res.error) {
      setAmount('');
      setDescription('');
      setMerchant('');
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      const res = await deleteExpense(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const byCategory = EXPENSE_CATEGORIES.map(c => ({
    name: c.label,
    value: expenses.filter(e => e.category === c.value).reduce((sum, e) => sum + e.amount, 0),
    color: c.color,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  // Monthly trend (last 6 months dynamically computed)
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = months[d.getMonth()];
    const year = d.getFullYear();

    const mExpenses = expenses.filter((exp: any) => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === year;
    });

    const expSum = mExpenses.reduce((sum: number, item: any) => sum + item.amount, 0);

    trendData.push({
      month: mName,
      amount: expSum,
    });
  }

  const topCategories = byCategory.slice(0, 6);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-danger" />
            Expense Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Track and analyze all your spending</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Expense
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
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(totalExpenses)}</p>
              <div className="flex items-center gap-1 text-xs text-danger mt-1">
                <TrendingDown className="w-3 h-3" />
                <span>Active Tracking</span>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Daily Average</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(Math.round(totalExpenses / 30))}</p>
              <p className="text-xs text-text-muted mt-1">Based on this month</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Top Category</p>
              <p className="text-2xl font-bold text-text mt-2">{topCategories[0]?.name || 'N/A'}</p>
              <p className="text-xs text-text-muted mt-1">{topCategories[0] ? formatCurrency(topCategories[0].value) : ''}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trend */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '150ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Spending Trend</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/1000)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => [formatCurrency(v), 'Expenses']} />
                    <Line type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4, stroke: '#020617', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '200ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Category Breakdown</h3>
              {topCategories.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategories} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/1000)}K`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} width={75} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => [formatCurrency(v)]} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                        {topCategories.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-text-muted text-xs">No expenses logged yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Filter */}
      <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap items-center gap-2 pb-1 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <button onClick={() => setFilterCategory('all')} className={cn('flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterCategory === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>All</button>
        {EXPENSE_CATEGORIES.slice(0, 8).map(c => (
          <button key={c.value} onClick={() => setFilterCategory(c.value)} className={cn('flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterCategory === c.value ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>{c.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Merchant</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const catMeta = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                const Icon = iconMap[catMeta?.icon || 'MoreHorizontal'] || MoreHorizontal;
                return (
                  <tr key={expense.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${catMeta?.color}15` }}>
                          <Icon className="w-4 h-4" style={{ color: catMeta?.color }} />
                        </div>
                        <span className="text-sm font-medium text-text">{catMeta?.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{expense.description}</td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{expense.merchant || '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{formatDate(expense.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-danger text-right">-{formatCurrency(expense.amount)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-text-muted">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Expense</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="What was this for?" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Merchant (Optional)</label>
                <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Amazon, Uber" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">Add Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
