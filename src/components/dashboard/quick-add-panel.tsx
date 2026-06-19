'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { INCOME_SOURCES, EXPENSE_CATEGORIES } from '@/lib/constants';
import { addIncome } from '@/actions/income';
import { addExpense } from '@/actions/expenses';
import { addBorrowing, addLending, getBorrowings, getLendings, addBorrowingRepayment, addLendingPayment } from '@/actions/debt';
import {
  ArrowDownLeft, ArrowUpRight, HandCoins, Handshake, Plus,
  CheckCircle2, Loader2, Sparkles,
} from 'lucide-react';

type TabType = 'income' | 'expense' | 'borrowing' | 'lending';

interface QuickAddPanelProps {
  onTransactionAdded: () => void;
}

export default function QuickAddPanel({ onTransactionAdded }: QuickAddPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Income fields
  const [incomeSource, setIncomeSource] = useState('salary');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDesc, setIncomeDesc] = useState('');

  // Expense fields
  const [expenseCategory, setExpenseCategory] = useState('food');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  // Borrowing fields
  const [lenderName, setLenderName] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');

  // Lending fields
  const [borrowerName, setBorrowerName] = useState('');
  const [lendAmount, setLendAmount] = useState('');
  const [lendNotes, setLendNotes] = useState('');

  // Debt Actions (new or repayment)
  const [borrowAction, setBorrowAction] = useState<'new' | 'repayment'>('new');
  const [lendAction, setLendAction] = useState<'new' | 'payment'>('new');
  const [borrowingsList, setBorrowingsList] = useState<any[]>([]);
  const [lendingsList, setLendingsList] = useState<any[]>([]);
  const [selectedBorrowingId, setSelectedBorrowingId] = useState('');
  const [selectedLendingId, setSelectedLendingId] = useState('');

  const loadDebtData = async () => {
    try {
      const [borrowData, lendData] = await Promise.all([
        getBorrowings(),
        getLendings(),
      ]);
      const activeBorrowings = (borrowData || []).filter((b: any) => b.remainingBalance > 0);
      const activeLendings = (lendData || []).filter((l: any) => l.remainingBalance > 0);
      setBorrowingsList(activeBorrowings);
      setLendingsList(activeLendings);
      
      if (activeBorrowings.length > 0) {
        setSelectedBorrowingId(activeBorrowings[0].id);
      } else {
        setSelectedBorrowingId('');
      }
      
      if (activeLendings.length > 0) {
        setSelectedLendingId(activeLendings[0].id);
      } else {
        setSelectedLendingId('');
      }
    } catch (err) {
      console.error('Failed to load debt records for Quick Add:', err);
    }
  };

  useEffect(() => {
    loadDebtData();
  }, []);

  const tabs = [
    { id: 'income' as TabType, label: 'Income', icon: <ArrowDownLeft className="w-3.5 h-3.5" />, color: '#22C55E' },
    { id: 'expense' as TabType, label: 'Expense', icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: '#EF4444' },
    { id: 'borrowing' as TabType, label: 'Borrowing', icon: <HandCoins className="w-3.5 h-3.5" />, color: '#F59E0B' },
    { id: 'lending' as TabType, label: 'Lending', icon: <Handshake className="w-3.5 h-3.5" />, color: '#8B5CF6' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const resetFields = () => {
    setIncomeAmount(''); setIncomeDesc('');
    setExpenseAmount(''); setExpenseDesc('');
    setLenderName(''); setBorrowAmount(''); setBorrowNotes('');
    setBorrowerName(''); setLendAmount(''); setLendNotes('');
    setBorrowAction('new'); setLendAction('new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result: any;

      if (activeTab === 'income') {
        if (!incomeAmount || !incomeDesc) return;
        result = await addIncome({
          source: incomeSource,
          amount: Number(incomeAmount),
          description: incomeDesc,
          date: todayStr,
          recurring: false,
        });
      } else if (activeTab === 'expense') {
        if (!expenseAmount || !expenseDesc) return;
        result = await addExpense({
          category: expenseCategory,
          amount: Number(expenseAmount),
          description: expenseDesc,
          date: todayStr,
        });
      } else if (activeTab === 'borrowing') {
        if (borrowAction === 'new') {
          if (!lenderName || !borrowAmount) return;
          result = await addBorrowing({
            lenderName,
            amount: Number(borrowAmount),
            notes: borrowNotes || undefined,
          });
        } else {
          if (!selectedBorrowingId || !borrowAmount) return;
          result = await addBorrowingRepayment(selectedBorrowingId, {
            amount: Number(borrowAmount),
            date: todayStr,
            note: borrowNotes || 'Repayment made',
          });
        }
      } else {
        if (lendAction === 'new') {
          if (!borrowerName || !lendAmount) return;
          result = await addLending({
            borrowerName,
            amount: Number(lendAmount),
            notes: lendNotes || undefined,
          });
        } else {
          if (!selectedLendingId || !lendAmount) return;
          result = await addLendingPayment(selectedLendingId, {
            amount: Number(lendAmount),
            date: todayStr,
            note: lendNotes || 'Repayment received',
          });
        }
      }

      if (!result?.error) {
        setShowSuccess(true);
        resetFields();
        loadDebtData();
        onTransactionAdded();
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Quick add failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeColor = tabs.find(t => t.id === activeTab)?.color || '#22C55E';

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '50ms' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))' }}>
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Quick Add</h2>
          <p className="text-[11px] text-text-muted">Add today&apos;s transactions instantly</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer',
              activeTab === tab.id
                ? 'text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-hover border border-transparent hover:border-border'
            )}
            style={activeTab === tab.id ? { backgroundColor: tab.color } : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pb-5">
        {/* Success Banner */}
        {showSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-success-muted text-success text-xs font-medium animate-slide-up">
            <CheckCircle2 className="w-4 h-4" />
            Added successfully!
          </div>
        )}

        {activeTab === 'income' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Source</label>
                <select
                  value={incomeSource}
                  onChange={e => setIncomeSource(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                >
                  {INCOME_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={e => setIncomeAmount(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">Description</label>
              <input
                type="text"
                value={incomeDesc}
                onChange={e => setIncomeDesc(e.target.value)}
                required
                placeholder="e.g. Freelance payment, Salary..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">Description</label>
              <input
                type="text"
                value={expenseDesc}
                onChange={e => setExpenseDesc(e.target.value)}
                required
                placeholder="e.g. Lunch, Uber ride..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {activeTab === 'borrowing' && (
          <div className="space-y-3 animate-fade-in">
            {/* Toggle borrow action type */}
            <div className="flex bg-background border border-border/80 rounded-lg p-0.5 w-full">
              <button
                type="button"
                onClick={() => setBorrowAction('new')}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  borrowAction === 'new' ? "bg-surface shadow text-text" : "text-text-muted hover:text-text"
                )}
              >
                New Borrowing
              </button>
              <button
                type="button"
                onClick={() => setBorrowAction('repayment')}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  borrowAction === 'repayment' ? "bg-surface shadow text-text" : "text-text-muted hover:text-text"
                )}
              >
                Log Repayment
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {borrowAction === 'new' ? (
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Lender Name</label>
                  <input
                    type="text"
                    value={lenderName}
                    onChange={e => setLenderName(e.target.value)}
                    required
                    placeholder="e.g. Rahul, Bank..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Lender</label>
                  {borrowingsList.length > 0 ? (
                    <select
                      value={selectedBorrowingId}
                      onChange={e => setSelectedBorrowingId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                    >
                      {borrowingsList.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.lenderName} (O/S: ₹{b.remainingBalance})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-muted focus:outline-none opacity-60"
                    >
                      <option>No active borrowings</option>
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={e => setBorrowAmount(e.target.value)}
                  required
                  placeholder="0"
                  max={borrowAction === 'repayment' ? borrowingsList.find(b => b.id === selectedBorrowingId)?.remainingBalance : undefined}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">Notes (optional)</label>
              <input
                type="text"
                value={borrowNotes}
                onChange={e => setBorrowNotes(e.target.value)}
                placeholder={borrowAction === 'new' ? "e.g. For emergency, Will return next week..." : "e.g. Partial repayment, Paid in full..."}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {activeTab === 'lending' && (
          <div className="space-y-3 animate-fade-in">
            {/* Toggle lend action type */}
            <div className="flex bg-background border border-border/80 rounded-lg p-0.5 w-full">
              <button
                type="button"
                onClick={() => setLendAction('new')}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  lendAction === 'new' ? "bg-surface shadow text-text" : "text-text-muted hover:text-text"
                )}
              >
                New Lending
              </button>
              <button
                type="button"
                onClick={() => setLendAction('payment')}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  lendAction === 'payment' ? "bg-surface shadow text-text" : "text-text-muted hover:text-text"
                )}
              >
                Log Repayment
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {lendAction === 'new' ? (
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Borrower Name</label>
                  <input
                    type="text"
                    value={borrowerName}
                    onChange={e => setBorrowerName(e.target.value)}
                    required
                    placeholder="e.g. Amit, Priya..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Borrower</label>
                  {lendingsList.length > 0 ? (
                    <select
                      value={selectedLendingId}
                      onChange={e => setSelectedLendingId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                    >
                      {lendingsList.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.borrowerName} (O/S: ₹{l.remainingBalance})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-muted focus:outline-none opacity-60"
                    >
                      <option>No active lendings</option>
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={lendAmount}
                  onChange={e => setLendAmount(e.target.value)}
                  required
                  placeholder="0"
                  max={lendAction === 'payment' ? lendingsList.find(l => l.id === selectedLendingId)?.remainingBalance : undefined}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">Notes (optional)</label>
              <input
                type="text"
                value={lendNotes}
                onChange={e => setLendNotes(e.target.value)}
                placeholder={lendAction === 'new' ? "e.g. For rent, Will collect next month..." : "e.g. Received partial payment..."}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || (activeTab === 'borrowing' && borrowAction === 'repayment' && borrowingsList.length === 0) || (activeTab === 'lending' && lendAction === 'payment' && lendingsList.length === 0)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg text-white transition-all disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: activeColor }}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {activeTab === 'income' 
                ? 'Add Income' 
                : activeTab === 'expense' 
                  ? 'Add Expense' 
                  : activeTab === 'borrowing' 
                    ? (borrowAction === 'new' ? 'Add Borrowing' : 'Log Repayment') 
                    : (lendAction === 'new' ? 'Add Lending' : 'Log Repayment')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
