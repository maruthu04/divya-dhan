'use client';

import { useState, useEffect } from 'react';
import { getGoals, addGoal, updateGoalAmount, deleteGoal } from '@/actions/goals';
import { GOAL_CATEGORIES } from '@/lib/constants';
import { formatCurrency, formatCompactCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Target, Plus, X, Home, Car, Shield, Plane, GraduationCap, Heart, Building2, Sunset, Trash2, Loader2, Edit2 } from 'lucide-react';

const iconMap: Record<string, any> = { Home, Car, Shield, Plane, GraduationCap, Heart, Building2, Sunset, Target };

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states (Add Goal)
  const [name, setName] = useState('');
  const [category, setCategory] = useState('house');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editSavedVal, setEditSavedVal] = useState('');

  const loadData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    const data = await getGoals();
    setGoals(data);
    if (isInitial) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const catMeta = GOAL_CATEGORIES.find(c => c.value === category);

    const res = await addGoal({
      name,
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      deadline: deadline || undefined,
      icon: catMeta?.icon || 'Target',
      color: catMeta?.color || '#00C896',
      notes,
    });

    if (!res.error) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setNotes('');
      setShowForm(false);
      loadData();
    }
  };

  const handleUpdateSaved = async (id: string) => {
    if (!editSavedVal) return;
    const res = await updateGoalAmount(id, Number(editSavedVal));
    if (!res.error) {
      setEditingGoalId(null);
      setEditSavedVal('');
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const res = await deleteGoal(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Target className="w-6 h-6 text-ai" /> Financial Goals</h1>
          <p className="text-sm text-text-muted mt-1">Track progress towards your financial milestones</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add Goal</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Active Goals</p>
              <p className="text-2xl font-bold text-text mt-2">{goals.length}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Target</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCompactCurrency(totalTarget)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Saved</p>
              <p className="text-2xl font-bold text-primary mt-2">{formatCompactCurrency(totalSaved)}</p>
            </div>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, i) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const Icon = iconMap[goal.icon] || Target;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div key={goal.id} className="bg-surface border border-border rounded-xl p-5 card-hover animate-slide-up relative group" style={{ animationDelay: `${(i + 3) * 50}ms` }}>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="absolute top-4 right-4 p-1.5 bg-background hover:bg-danger/10 border border-border hover:border-danger/20 rounded-lg text-text-muted hover:text-danger opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full mr-6" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-text">{goal.name}</h3>
                  {goal.notes && <p className="text-xs text-text-muted mt-0.5">{goal.notes}</p>}

                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex justify-between mt-3">
                    <div>
                      <p className="text-xs text-text-muted">Saved</p>
                      {editingGoalId === goal.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            value={editSavedVal}
                            onChange={e => setEditSavedVal(e.target.value)}
                            placeholder="Amount"
                            className="w-16 px-1.5 py-0.5 bg-background border border-border rounded text-xs text-text focus:outline-none"
                          />
                          <button onClick={() => handleUpdateSaved(goal.id)} className="px-1.5 py-0.5 bg-primary text-background rounded text-[10px] font-bold cursor-pointer">Save</button>
                          <button onClick={() => setEditingGoalId(null)} className="px-1 py-0.5 bg-surface-hover rounded text-[10px] cursor-pointer">X</button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-text mt-1 flex items-center gap-1.5">
                          {formatCompactCurrency(goal.currentAmount)}
                          <button onClick={() => { setEditingGoalId(goal.id); setEditSavedVal(String(goal.currentAmount)); }} className="p-0.5 rounded hover:bg-surface-hover text-text-muted cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Target</p>
                      <p className="text-sm font-semibold text-text mt-1">{formatCompactCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs">
                    <p className="text-text-muted">
                      Remaining: <span className="text-text font-medium">{formatCompactCurrency(remaining)}</span>
                    </p>
                    {goal.deadline && (
                      <span className="text-text-muted text-[10px]">Due: {formatDate(goal.deadline)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-8 text-sm text-text-muted border border-border border-dashed rounded-xl">
                No goals created yet. Click Add Goal to create one.
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-text">Add Goal</h2><button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button></div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Goal Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Buy House" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">{GOAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Target (₹)</label><input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
                <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Saved (₹)</label><input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              </div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Deadline (Optional)</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Notes (Optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why this goal matters..." className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50 resize-none h-16" /></div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">Add Goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
