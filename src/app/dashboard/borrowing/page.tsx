'use client';

import { useState, useEffect } from 'react';
import { getBorrowings, addBorrowing, addBorrowingRepayment, deleteBorrowing } from '@/actions/debt';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CreditCard, Plus, X, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Trash2, Loader2, Coins } from 'lucide-react';

const statusConfig: Record<string, any> = {
  pending: { label: 'Pending', color: 'text-danger', bg: 'bg-danger/10 border-danger/25', icon: Clock },
  partial: { label: 'Partial', color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: AlertCircle },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle2 },
};

export default function BorrowingPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add Borrowing Form states
  const [lenderName, setLenderName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Add Repayment Form state
  const [repaymentAmount, setRepaymentAmount] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getBorrowings();
    setBorrowings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName || !amount) return;

    const res = await addBorrowing({
      lenderName,
      amount: Number(amount),
      dueDate: dueDate || undefined,
      notes,
    });

    if (!res.error) {
      setLenderName('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setShowForm(false);
      loadData();
    }
  };

  const handleAddRepayment = async (e: React.FormEvent, borrowingId: string) => {
    e.preventDefault();
    if (!repaymentAmount) return;

    const res = await addBorrowingRepayment(borrowingId, {
      amount: Number(repaymentAmount),
      date: new Date().toISOString().split('T')[0],
      note: 'Repayment made',
    });

    if (!res.error) {
      setRepaymentAmount('');
      loadData();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this borrowing record?')) {
      const res = await deleteBorrowing(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const totalBorrowed = borrowings.reduce((sum, b) => sum + b.amount, 0);
  const outstanding = borrowings.reduce((sum, b) => sum + b.remainingBalance, 0);
  const repaid = totalBorrowed - outstanding;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><CreditCard className="w-6 h-6 text-danger" /> Borrowing Management</h1>
          <p className="text-sm text-text-muted mt-1">Track money you&apos;ve borrowed from others</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add Borrowing</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Borrowed</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(totalBorrowed)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Outstanding</p>
              <p className="text-2xl font-bold text-danger mt-2">{formatCurrency(outstanding)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Repaid</p>
              <p className="text-2xl font-bold text-success mt-2">{formatCurrency(repaid)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {borrowings.map((borrowing, i) => {
              const status = statusConfig[borrowing.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === borrowing.id;
              const progress = ((borrowing.amount - borrowing.remainingBalance) / borrowing.amount) * 100;

              return (
                <div key={borrowing.id} className="bg-surface border border-border rounded-xl overflow-hidden animate-slide-up card-hover" style={{ animationDelay: `${(i + 3) * 50}ms` }}>
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : borrowing.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger font-bold text-sm">{borrowing.lenderName.charAt(0)}</div>
                        <div>
                          <h3 className="text-sm font-semibold text-text">{borrowing.lenderName}</h3>
                          <p className="text-xs text-text-muted">{borrowing.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                          <p className="text-sm font-bold text-text">{formatCurrency(borrowing.remainingBalance)}</p>
                          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border', status.bg, status.color)}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(borrowing.id, e)}
                          className="p-1.5 hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg text-text-muted hover:text-danger cursor-pointer"
                          title="Delete borrowing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted ml-1" /> : <ChevronDown className="w-4 h-4 text-text-muted ml-1" />}
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-danger rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                      <span>Repaid: {formatCurrency(borrowing.amount - borrowing.remainingBalance)}</span>
                      <span>Total: {formatCurrency(borrowing.amount)}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 bg-background/50 animate-fade-in space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Repayments History */}
                        <div className="space-y-3">
                          {borrowing.dueDate && (
                            <div className="flex justify-between text-xs">
                              <span className="text-text-muted">Due Date</span>
                              <span className="text-text">{formatDate(borrowing.dueDate)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Repayment History</p>
                            {borrowing.repayments && borrowing.repayments.length > 0 ? (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {borrowing.repayments.map((r: any) => (
                                  <div key={r.id} className="flex justify-between text-xs bg-surface border border-border/40 rounded-lg px-3 py-2">
                                    <span className="text-text-muted">{formatDate(r.date)}</span>
                                    <span className="text-success font-medium">-{formatCurrency(r.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-text-muted italic">No repayments recorded yet</p>
                            )}
                          </div>
                        </div>

                        {/* Add payment form */}
                        {borrowing.remainingBalance > 0 && (
                          <div className="bg-surface/50 border border-border rounded-xl p-4 self-start">
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-3 flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Log Repayment Sent</p>
                            <form onSubmit={(e) => handleAddRepayment(e, borrowing.id)} className="space-y-2">
                              <div>
                                <input
                                  type="number"
                                  placeholder="Amount (₹)"
                                  value={repaymentAmount}
                                  onChange={e => setRepaymentAmount(e.target.value)}
                                  required
                                  max={borrowing.remainingBalance}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text focus:outline-none focus:border-primary/50"
                                />
                              </div>
                              <button type="submit" className="w-full py-1.5 bg-primary hover:bg-primary-hover text-background text-xs font-medium rounded-lg transition-colors cursor-pointer">
                                Log Repayment
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {borrowings.length === 0 && (
              <div className="text-center py-8 text-sm text-text-muted border border-border border-dashed rounded-xl">
                No borrowing logs found. Click Add Borrowing to create one.
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Borrowing Record</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Lender Name</label><input type="text" value={lenderName} onChange={e => setLenderName(e.target.value)} required placeholder="Name" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Amount (₹)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Due Date (Optional)</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50 resize-none h-20" /></div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">Add Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
