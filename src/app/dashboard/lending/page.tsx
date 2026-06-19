'use client';

import { useState, useEffect } from 'react';
import { getLendings, addLending, addLendingPayment, deleteLending } from '@/actions/debt';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { HandCoins, Plus, X, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Trash2, Loader2, Coins } from 'lucide-react';

const statusConfig: Record<string, any> = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: Clock },
  partial: { label: 'Partial', color: 'text-ai', bg: 'bg-ai/10 border-ai/25', icon: AlertCircle },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle2 },
};

export default function LendingPage() {
  const [lendings, setLendings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add Lending Form states
  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Add Payment Form state
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getLendings();
    setLendings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName || !amount) return;

    const res = await addLending({
      borrowerName,
      amount: Number(amount),
      dueDate: dueDate || undefined,
      notes,
    });

    if (!res.error) {
      setBorrowerName('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setShowForm(false);
      loadData();
    }
  };

  const handleAddPayment = async (e: React.FormEvent, lendingId: string) => {
    e.preventDefault();
    if (!paymentAmount) return;

    const res = await addLendingPayment(lendingId, {
      amount: Number(paymentAmount),
      date: new Date().toISOString().split('T')[0],
      note: 'Repayment received',
    });

    if (!res.error) {
      setPaymentAmount('');
      loadData();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lending record?')) {
      const res = await deleteLending(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const totalLent = lendings.reduce((sum, l) => sum + l.amount, 0);
  const outstanding = lendings.reduce((sum, l) => sum + l.remainingBalance, 0);
  const recovered = totalLent - outstanding;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><HandCoins className="w-6 h-6 text-warning" /> Lending Management</h1>
          <p className="text-sm text-text-muted mt-1">Track money you&apos;ve given to others</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add Lending</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Lent</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(totalLent)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Outstanding</p>
              <p className="text-2xl font-bold text-warning mt-2">{formatCurrency(outstanding)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Recovered</p>
              <p className="text-2xl font-bold text-success mt-2">{formatCurrency(recovered)}</p>
            </div>
          </div>

          {/* Lending Cards */}
          <div className="space-y-3">
            {lendings.map((lending, i) => {
              const status = statusConfig[lending.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === lending.id;
              const progress = ((lending.amount - lending.remainingBalance) / lending.amount) * 100;

              return (
                <div key={lending.id} className="bg-surface border border-border rounded-xl overflow-hidden animate-slide-up card-hover" style={{ animationDelay: `${(i + 3) * 50}ms` }}>
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : lending.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning font-bold text-sm">
                          {lending.borrowerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text">{lending.borrowerName}</h3>
                          <p className="text-xs text-text-muted">{lending.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                          <p className="text-sm font-bold text-text">{formatCurrency(lending.remainingBalance)}</p>
                          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border', status.bg, status.color)}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(lending.id, e)}
                          className="p-1.5 hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg text-text-muted hover:text-danger cursor-pointer"
                          title="Delete lending"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted ml-1" /> : <ChevronDown className="w-4 h-4 text-text-muted ml-1" />}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                      <span>Paid: {formatCurrency(lending.amount - lending.remainingBalance)}</span>
                      <span>Total: {formatCurrency(lending.amount)}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 bg-background/50 animate-fade-in space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Information & Repayment history */}
                        <div className="space-y-3">
                          {lending.dueDate && (
                            <div className="flex justify-between text-xs">
                              <span className="text-text-muted">Due Date</span>
                              <span className="text-text">{formatDate(lending.dueDate)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Payment History</p>
                            {lending.payments && lending.payments.length > 0 ? (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {lending.payments.map((p: any) => (
                                  <div key={p.id} className="flex justify-between text-xs bg-surface border border-border/40 rounded-lg px-3 py-2">
                                    <span className="text-text-muted">{formatDate(p.date)}</span>
                                    <span className="text-success font-medium">+{formatCurrency(p.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-text-muted italic">No payments recorded yet</p>
                            )}
                          </div>
                        </div>

                        {/* Add payment form inside the card */}
                        {lending.remainingBalance > 0 && (
                          <div className="bg-surface/50 border border-border rounded-xl p-4 self-start">
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-3 flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Log Payment Received</p>
                            <form onSubmit={(e) => handleAddPayment(e, lending.id)} className="space-y-2">
                              <div>
                                <input
                                  type="number"
                                  placeholder="Amount (₹)"
                                  value={paymentAmount}
                                  onChange={e => setPaymentAmount(e.target.value)}
                                  required
                                  max={lending.remainingBalance}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text focus:outline-none focus:border-primary/50"
                                />
                              </div>
                              <button type="submit" className="w-full py-1.5 bg-primary hover:bg-primary-hover text-background text-xs font-medium rounded-lg transition-colors cursor-pointer">
                                Log Payment
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
            {lendings.length === 0 && (
              <div className="text-center py-8 text-sm text-text-muted border border-border border-dashed rounded-xl">
                No lending logs found. Click Add Lending to create one.
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
              <h2 className="text-lg font-semibold text-text">Add Lending Record</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Borrower Name</label><input type="text" value={borrowerName} onChange={e => setBorrowerName(e.target.value)} required placeholder="Name" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
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
