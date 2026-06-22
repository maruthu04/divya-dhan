'use client';

import { useState, useEffect } from 'react';
import { getAccounts, addAccount, deleteAccount } from '@/actions/accounts';
import { getGoals, addMoneyToGoals } from '@/actions/goals';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { Building2, Wallet, PiggyBank, Lock, Plus, X, TrendingUp, Trash2, Loader2, Target, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const iconMap: Record<string, any> = { Building2, Wallet, PiggyBank, Lock };

const typeColors: Record<string, string> = {
  bank: '#3B82F6',
  wallet: '#8B5CF6',
  savings: '#F59E0B',
  locker: '#EC4899',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGoalMoneyModal, setShowGoalMoneyModal] = useState(false);
  const [goalUpdates, setGoalUpdates] = useState<Record<string, string>>({});
  const [isSavingGoalMoney, setIsSavingGoalMoney] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const loadData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    const [accountsData, goalsData] = await Promise.all([
      getAccounts(),
      getGoals()
    ]);
    setAccounts(accountsData);
    setGoals(goalsData);
    if (isInitial) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    const res = await addAccount({
      name,
      type,
      balance: Number(balance),
      bankName: type === 'bank' ? bankName : undefined,
      accountNumber: type === 'bank' ? accountNumber : undefined,
      color: typeColors[type] || '#3B82F6',
      icon: type === 'bank' ? 'Building2' : type === 'wallet' ? 'Wallet' : type === 'savings' ? 'PiggyBank' : 'Lock',
    });

    if (!res.error) {
      setName('');
      setBalance('');
      setBankName('');
      setAccountNumber('');
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const res = await deleteAccount(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const goalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0) + goalsSaved;
  const byType = [
    ...ACCOUNT_TYPES.map(t => ({
      name: t.label,
      value: accounts.filter(a => a.type === t.value).reduce((s, a) => s + a.balance, 0),
    })),
    { name: 'Goal Savings', value: goalsSaved }
  ].filter(t => t.value > 0);

  const pieColorsMap: Record<string, string> = {
    'Bank Account': '#3B82F6',
    'Wallet Cash': '#8B5CF6',
    'Savings': '#F59E0B',
    'Locker Cash': '#EC4899',
    'Goal Savings': '#00C896',
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-ai" />
            Bank Accounts
          </h1>
          <p className="text-sm text-text-muted mt-1">Track all your accounts, wallets, and savings</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Total Balance */}
          <div className="bg-gradient-to-r from-primary/10 via-ai/5 to-transparent border border-border rounded-xl p-6 animate-slide-up">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Balance</p>
            <p className="text-3xl font-bold text-text mt-2">{formatCurrency(totalBalance)}</p>
            <div className="flex items-center gap-1 text-xs text-success mt-1">
              <TrendingUp className="w-3 h-3" /><span>Across {accounts.length} accounts</span>
            </div>
          </div>

          {/* Balance Distribution + Account Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '100ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Balance Distribution</h3>
              {byType.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                          {byType.map((entry, i) => <Cell key={i} fill={pieColorsMap[entry.name] || '#64748B'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-3">
                    {byType.map((t, i) => (
                      <div key={t.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColorsMap[t.name] || '#64748B' }} />
                          <span className="text-xs text-text-secondary">{t.name}</span>
                        </div>
                        <span className="text-xs font-medium text-text">{formatCurrency(t.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-text-muted text-xs">No distribution data</div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Virtual Account: Other Savings (Goals) */}
              <div className="bg-surface border border-border rounded-xl p-5 card-hover animate-slide-up relative group" style={{ animationDelay: '50ms' }}>
                <button
                  onClick={() => {
                    const initialUpdates: Record<string, string> = {};
                    goals.forEach(g => {
                      initialUpdates[g.id] = '';
                    });
                    setGoalUpdates(initialUpdates);
                    setShowGoalMoneyModal(true);
                  }}
                  className="absolute top-4 right-4 p-1.5 bg-background hover:bg-primary/10 border border-border hover:border-primary/20 rounded-lg text-text-muted hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                  title="Add Money to Goals"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00C896]15">
                    <Target className="w-5 h-5 text-[#00C896]" />
                  </div>
                  <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-2 py-0.5 border border-border rounded-full mr-6">goals</span>
                </div>
                <h3 className="text-sm font-semibold text-text">Other savings for financial goals</h3>
                <p className="text-xs text-text-muted mt-0.5">Virtual goal accumulation fund</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-xl font-bold text-text">{formatCurrency(goalsSaved)}</p>
                  <button
                    onClick={() => {
                      const initialUpdates: Record<string, string> = {};
                      goals.forEach(g => {
                        initialUpdates[g.id] = '';
                      });
                      setGoalUpdates(initialUpdates);
                      setShowGoalMoneyModal(true);
                    }}
                    className="text-xs text-primary hover:text-primary-hover font-medium underline flex items-center gap-1 cursor-pointer"
                  >
                    Add Money
                  </button>
                </div>
              </div>

              {accounts.map((account, i) => {
                const Icon = iconMap[account.icon] || Building2;
                return (
                  <div key={account.id} className="bg-surface border border-border rounded-xl p-5 card-hover animate-slide-up relative group" style={{ animationDelay: `${(i + 2) * 50}ms` }}>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="absolute top-4 right-4 p-1.5 bg-background hover:bg-danger/10 border border-border hover:border-danger/20 rounded-lg text-text-muted hover:text-danger opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${account.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: account.color }} />
                      </div>
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-2 py-0.5 border border-border rounded-full mr-6">{account.type}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text">{account.name}</h3>
                    {account.bankName && <p className="text-xs text-text-muted mt-0.5">{account.bankName} {account.accountNumber}</p>}
                    <p className="text-xl font-bold text-text mt-3">{formatCurrency(account.balance)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Account</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Account Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. HDFC Savings" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Balance (₹)</label>
                <input type="number" value={balance} onChange={e => setBalance(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>
              {type === 'bank' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Bank Name</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Account Number</label>
                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. ****5321" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                  </div>
                </>
              )}
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">Add Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Goal Money Modal */}
      {showGoalMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowGoalMoneyModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Money to Goal Funds</h2>
              <button onClick={() => setShowGoalMoneyModal(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            
            {goals.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary mb-4">No active financial goals found.</p>
                <a href="/dashboard/goals" className="px-4 py-2 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  Create a Goal
                </a>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingGoalMoney(true);
                const updates = Object.entries(goalUpdates)
                  .map(([id, val]) => ({ id, amountToAdd: Number(val) || 0 }))
                  .filter(u => u.amountToAdd > 0);

                if (updates.length > 0) {
                  const res = await addMoneyToGoals(updates);
                  if (res.error) {
                    alert(res.error);
                  } else {
                    setShowGoalMoneyModal(false);
                    loadData();
                  }
                } else {
                  setShowGoalMoneyModal(false);
                }
                setIsSavingGoalMoney(false);
              }}>
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 mb-4">
                  {goals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                      <div className="max-w-[60%]">
                        <p className="text-sm font-medium text-text truncate">{goal.name}</p>
                        <p className="text-xs text-text-muted">Saved: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-muted">₹</span>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={goalUpdates[goal.id] || ''}
                          onChange={e => setGoalUpdates({ ...goalUpdates, [goal.id]: e.target.value })}
                          className="w-24 px-2 py-1.5 bg-background border border-border rounded text-sm text-text focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="submit"
                  disabled={isSavingGoalMoney}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-background font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingGoalMoney ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Funds'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
