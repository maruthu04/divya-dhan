'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Tv, CreditCard, Code, Dumbbell, Sparkles, Plus, 
  Trash, Edit2, Loader2, CalendarDays, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getSubscriptions, addSubscription, updateSubscription, 
  toggleSubscriptionActive, deleteSubscription 
} from '@/actions/subscriptions';

const CATEGORIES = [
  { value: 'Entertainment', label: 'Entertainment', icon: Tv, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  { value: 'Bills & Utilities', label: 'Bills & Utilities', icon: CreditCard, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  { value: 'Software', label: 'Software/SaaS', icon: Code, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  { value: 'Health & Wellness', label: 'Health & Wellness', icon: Dumbbell, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
  { value: 'Other', label: 'Other', icon: Sparkles, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' }
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'Entertainment',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadData = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Total monthly cost calculation
  const getMonthlyTotal = () => {
    return subscriptions
      .filter(s => s.active)
      .reduce((sum, s) => {
        let monthlyValue = s.amount;
        if (s.frequency === 'weekly') {
          monthlyValue = s.amount * 4.33; // 52 weeks / 12 months
        } else if (s.frequency === 'yearly') {
          monthlyValue = s.amount / 12;
        }
        return sum + monthlyValue;
      }, 0);
  };

  const getUpcomingRenewal = () => {
    const active = subscriptions.filter(s => s.active);
    if (active.length === 0) return null;
    return active.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleSubscriptionActive(id, !currentStatus);
      if (res.success) {
        toast.success(`Subscription ${!currentStatus ? 'activated' : 'paused'}!`);
        loadData();
      } else {
        toast.error(res.error || 'Failed to toggle status');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      const res = await deleteSubscription(id);
      if (res.success) {
        toast.success('Subscription deleted successfully!');
        loadData();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  const handleOpenEdit = (sub: any) => {
    setEditId(sub.id);
    setForm({
      name: sub.name,
      amount: sub.amount.toString(),
      category: sub.category,
      frequency: sub.frequency,
      startDate: new Date(sub.startDate).toISOString().split('T')[0],
      notes: sub.notes || '',
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      name: '',
      amount: '',
      category: 'Entertainment',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount.trim()) {
      toast.error('Name and Amount are required.');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (editId) {
        res = await updateSubscription(editId, {
          name: form.name,
          amount: Number(form.amount),
          category: form.category,
          frequency: form.frequency,
          startDate: form.startDate,
          notes: form.notes,
        });
      } else {
        res = await addSubscription({
          name: form.name,
          amount: Number(form.amount),
          category: form.category,
          frequency: form.frequency,
          startDate: form.startDate,
          notes: form.notes,
        });
      }

      if (res.success) {
        toast.success(`Subscription ${editId ? 'updated' : 'added'} successfully!`);
        setModalOpen(false);
        loadData();
      } else {
        toast.error(res.error || 'Failed to save subscription');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const monthlyTotal = getMonthlyTotal();
  const nextRenewal = getUpcomingRenewal();
  const activeCount = subscriptions.filter(s => s.active).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-text-muted mt-1">Track and manage recurring payments and services</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-background font-semibold rounded-lg text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI: Total Monthly */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Total Monthly Commitments</span>
          <p className="text-2xl font-bold text-text">₹{monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <span className="text-[10px] text-text-muted mt-1 block">Recalculated based on bill periods</span>
        </div>

        {/* KPI: Active Subscriptions */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Active Tracker</span>
          <p className="text-2xl font-bold text-text">{activeCount} <span className="text-sm font-medium text-text-muted">/ {subscriptions.length} entries</span></p>
          <span className="text-[10px] text-text-muted mt-1 block">Active services receiving alerts</span>
        </div>

        {/* KPI: Next Renewal */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Next Upcoming Renewal</span>
          {nextRenewal ? (
            <div>
              <p className="text-lg font-bold text-text truncate">{nextRenewal.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                ₹{nextRenewal.amount.toLocaleString('en-IN')} due on {new Date(nextRenewal.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-text-muted py-1.5">No active renewals soon</p>
          )}
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Your Subscriptions & Bills</h2>
          <span className="text-[11px] text-text-muted">{subscriptions.length} entries</span>
        </div>

        <div className="divide-y divide-border/50">
          {subscriptions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <Calendar className="w-10 h-10 text-text-muted" />
              <p className="text-sm text-text-muted">No subscriptions tracked yet.</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Add your first subscription now
              </button>
            </div>
          ) : (
            subscriptions.map(sub => {
              const catMeta = CATEGORIES.find(c => c.value === sub.category) || CATEGORIES[4];
              const CatIcon = catMeta.icon;
              const due = new Date(sub.nextDueDate);
              const daysLeft = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;

              return (
                <div key={sub.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-surface-hover/30 ${!sub.active ? 'opacity-60' : ''}`}>
                  {/* Category icon + Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: catMeta.bg, color: catMeta.color }}
                    >
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{sub.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted mt-0.5">
                        <span className="capitalize">{sub.frequency} renewal</span>
                        <span>•</span>
                        <span>{sub.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing + Renewal Status */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:text-right">
                    {/* Price */}
                    <div>
                      <p className="text-sm font-bold text-text">₹{sub.amount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">amount due</p>
                    </div>

                    {/* Next Due Date */}
                    {sub.active ? (
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {due.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                          isOverdue ? 'text-danger' : daysLeft <= 3 ? 'text-warning' : 'text-text-muted'
                        }`}>
                          {isOverdue 
                            ? 'Overdue' 
                            : daysLeft === 0 
                              ? 'Due Today' 
                              : daysLeft === 1 
                                ? 'Due tomorrow' 
                                : `Due in ${daysLeft} days`}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-text-muted">Paused</p>
                        <p className="text-[10px] text-text-muted mt-0.5">no alerts</p>
                      </div>
                    )}

                    {/* Active Toggle & Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Toggle status */}
                      <button 
                        onClick={() => handleToggleActive(sub.id, sub.active)}
                        className="p-1 hover:bg-border/30 rounded cursor-pointer transition-colors"
                        title={sub.active ? 'Pause subscription' : 'Activate subscription'}
                      >
                        {sub.active ? (
                          <ToggleRight className="w-6 h-6 text-primary" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-text-muted" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 hover:bg-border/30 rounded-lg text-text-secondary hover:text-text cursor-pointer transition-colors"
                        title="Edit subscription"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger cursor-pointer transition-colors"
                        title="Delete subscription"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">
                {editId ? 'Edit Subscription' : 'Add Subscription'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-border/30 rounded-lg text-text-muted hover:text-text cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Subscription Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Netflix, Airtel Fiber"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 649"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Billing Period</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">First Bill Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Billing details, credit card used, etc..."
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-border/30 text-text rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-background font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
