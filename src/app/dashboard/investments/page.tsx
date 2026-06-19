'use client';

import { useState, useEffect } from 'react';
import { getInvestments, addInvestment, deleteInvestment } from '@/actions/investments';
import { INVESTMENT_TYPES } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Plus, X, Trash2, Loader2, RefreshCw, CalendarClock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

// SIP Future Value: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
// Using 12% annual = 1% monthly as avg mutual fund return
const SIP_MONTHLY_RATE = 0.01;

function computeSIPValues(sipAmount: number, sipStartDate: Date) {
  const now = new Date();
  const monthsElapsed = Math.max(1,
    (now.getFullYear() - sipStartDate.getFullYear()) * 12 +
    (now.getMonth() - sipStartDate.getMonth()) + 1
  );

  const investedAmount = sipAmount * monthsElapsed;
  const r = SIP_MONTHLY_RATE;
  const currentValue = sipAmount * (((Math.pow(1 + r, monthsElapsed) - 1) / r) * (1 + r));

  return {
    investedAmount,
    currentValue: Math.round(currentValue * 100) / 100,
    monthsElapsed,
  };
}

function getHistoricalMonths(timeframe: '6M' | '1Y' | 'ALL', oldestDate?: Date) {
  const now = new Date();
  const months: Date[] = [];
  let limit = 6;
  if (timeframe === '1Y') limit = 12;
  else if (timeframe === 'ALL') {
    if (oldestDate) {
      const diffMonths = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth()) + 1;
      limit = Math.max(6, diffMonths);
    } else {
      limit = 6;
    }
  }

  for (let i = limit - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
}

function generateHistoricalData(enrichedInvestments: any[], timeframe: '6M' | '1Y' | 'ALL') {
  let oldestDate = new Date();
  let hasInvestments = false;
  enrichedInvestments.forEach(inv => {
    hasInvestments = true;
    const date = inv.isSIP ? new Date(inv.sipStartDate) : new Date(inv.buyDate);
    if (date < oldestDate) oldestDate = date;
  });

  if (!hasInvestments) {
    const now = new Date();
    const limit = timeframe === '6M' ? 6 : timeframe === '1Y' ? 12 : 6;
    const data = [];
    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        invested: 0,
        value: 0,
        roi: 0
      });
    }
    return data;
  }

  const now = new Date();
  const monthsList = getHistoricalMonths(timeframe, oldestDate);

  return monthsList.map(monthDate => {
    let monthlyInvested = 0;
    let monthlyValue = 0;

    enrichedInvestments.forEach(inv => {
      if (inv.isSIP && inv.sipAmount && inv.sipStartDate) {
        const startDate = new Date(inv.sipStartDate);
        const startYearMonth = startDate.getFullYear() * 12 + startDate.getMonth();
        const currentYearMonth = monthDate.getFullYear() * 12 + monthDate.getMonth();
        const todayYearMonth = now.getFullYear() * 12 + now.getMonth();

        if (currentYearMonth >= startYearMonth) {
          const maxMonths = (todayYearMonth - startYearMonth) + 1;
          const elapsed = Math.min(maxMonths, Math.max(1, (currentYearMonth - startYearMonth) + 1));
          
          const invested = inv.sipAmount * elapsed;
          let value = 0;
          if (elapsed === maxMonths) {
            value = inv.currentValue;
          } else {
            const r = SIP_MONTHLY_RATE;
            value = inv.sipAmount * (((Math.pow(1 + r, elapsed) - 1) / r) * (1 + r));
            value = Math.round(value * 100) / 100;
          }
          monthlyInvested += invested;
          monthlyValue += value;
        }
      } else {
        const buyDate = new Date(inv.buyDate);
        const buyYearMonth = buyDate.getFullYear() * 12 + buyDate.getMonth();
        const currentYearMonth = monthDate.getFullYear() * 12 + monthDate.getMonth();
        const todayYearMonth = now.getFullYear() * 12 + now.getMonth();

        if (currentYearMonth >= buyYearMonth) {
          const totalMonths = todayYearMonth - buyYearMonth;
          const invested = inv.investedAmount;
          let value = inv.currentValue;

          if (totalMonths > 0) {
            const m = currentYearMonth - buyYearMonth;
            const ratio = Math.min(1, Math.max(0, m / totalMonths));
            value = invested + ratio * (inv.currentValue - invested);
          }
          monthlyInvested += invested;
          monthlyValue += value;
        }
      }
    });

    const gain = monthlyValue - monthlyInvested;
    const roi = monthlyInvested > 0 ? (gain / monthlyInvested) * 100 : 0;

    const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    return {
      month: formattedMonth,
      invested: Math.round(monthlyInvested),
      value: Math.round(monthlyValue),
      roi: parseFloat(roi.toFixed(2)),
    };
  });
}

const formatYAxis = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const invested = data.invested;
    const value = data.value;
    const gain = value - invested;
    const roi = data.roi;

    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl min-w-[200px] text-xs space-y-2">
        <p className="font-semibold text-text border-b border-border/40 pb-1.5 mb-2">{data.month}</p>
        <div className="flex justify-between items-center gap-4">
          <span className="text-text-muted">Invested:</span>
          <span className="font-medium text-text">{formatCurrency(invested)}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-text-muted">Current Value:</span>
          <span className="font-medium text-text">{formatCurrency(value)}</span>
        </div>
        <div className="flex justify-between items-center gap-4 pt-1 border-t border-dashed border-border/40">
          <span className="text-text-muted">Total Returns:</span>
          <span className={cn('font-semibold', gain >= 0 ? 'text-success' : 'text-danger')}>
            {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-text-muted">ROI:</span>
          <span className={cn('font-bold px-1.5 py-0.5 rounded text-[10px]', gain >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
            {formatPercentage(roi)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | 'ALL'>('6M');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('stocks');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');

  // SIP states
  const [isSIP, setIsSIP] = useState(false);
  const [sipAmount, setSipAmount] = useState('');
  const [sipStartDate, setSipStartDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    const data = await getInvestments();
    setInvestments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSIP) {
      if (!name || !sipAmount) return;
      const res = await addInvestment({
        name,
        type,
        investedAmount: 0, // Will be computed server-side
        currentValue: 0,   // Will be computed server-side
        buyDate: sipStartDate,
        notes,
        isSIP: true,
        sipAmount: Number(sipAmount),
        sipStartDate,
      });
      if (!res.error) {
        setName(''); setSipAmount(''); setNotes('');
        setSipStartDate(new Date().toISOString().split('T')[0]);
        setIsSIP(false);
        setShowForm(false);
        loadData();
      }
    } else {
      if (!name || !investedAmount || !currentValue) return;
      const res = await addInvestment({
        name,
        type,
        investedAmount: Number(investedAmount),
        currentValue: Number(currentValue),
        buyDate: new Date().toISOString().split('T')[0],
        notes,
      });
      if (!res.error) {
        setName(''); setInvestedAmount(''); setCurrentValue(''); setNotes('');
        setShowForm(false);
        loadData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      const res = await deleteInvestment(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  // Apply SIP computation to investments for display
  const enrichedInvestments = investments.map((inv: any) => {
    if (inv.isSIP && inv.sipAmount && inv.sipStartDate) {
      const computed = computeSIPValues(inv.sipAmount, new Date(inv.sipStartDate));
      return {
        ...inv,
        investedAmount: computed.investedAmount,
        currentValue: computed.currentValue,
        monthsElapsed: computed.monthsElapsed,
      };
    }
    return inv;
  });

  const filteredInvestments = filterType === 'all'
    ? enrichedInvestments
    : enrichedInvestments.filter(i => i.type === filterType);

  const totalInvested = enrichedInvestments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrent = enrichedInvestments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalReturn = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;

  // Allocation data
  const allocation = INVESTMENT_TYPES.map(t => ({
    name: t.label,
    value: enrichedInvestments.filter(i => i.type === t.value).reduce((s, i) => s + i.currentValue, 0),
    color: t.color,
  })).filter(a => a.value > 0);

  // Performance over time
  const perfData = generateHistoricalData(enrichedInvestments, timeframe);

  // SIP preview computation
  const sipPreview = isSIP && sipAmount && sipStartDate
    ? computeSIPValues(Number(sipAmount), new Date(sipStartDate))
    : null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><TrendingUp className="w-6 h-6 text-success" /> Investment Portfolio</h1>
          <p className="text-sm text-text-muted mt-1">Track stocks, mutual funds, gold, crypto and more</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add Investment</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Invested</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Current Value</p>
              <p className="text-2xl font-bold text-text mt-2">{formatCurrency(totalCurrent)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Gain/Loss</p>
              <p className={cn('text-2xl font-bold mt-2', totalGain >= 0 ? 'text-success' : 'text-danger')}>
                {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Overall Return</p>
              <p className={cn('text-2xl font-bold mt-2', totalReturn >= 0 ? 'text-success' : 'text-danger')}>
                {formatPercentage(totalReturn)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">Portfolio Performance</h3>
                <div className="flex bg-background border border-border rounded-lg p-0.5">
                  {(['6M', '1Y', 'ALL'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer",
                        timeframe === tf
                          ? "bg-surface text-primary border border-border shadow-sm"
                          : "text-text-secondary hover:text-text"
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData}>
                    <defs>
                      <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748B" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={formatYAxis} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="Current Value" stroke="#22C55E" strokeWidth={2.5} fill="url(#valueGrad)" dot={false} activeDot={{ r: 5, fill: '#22C55E', stroke: '#020617', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="invested" name="Invested Amount" stroke="#64748B" strokeWidth={2} strokeDasharray="4 4" fill="url(#investedGrad)" dot={false} activeDot={{ r: 4, fill: '#64748B', stroke: '#020617', strokeWidth: 1.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Allocation */}
            <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
              <h3 className="text-sm font-semibold text-text mb-4">Asset Allocation</h3>
              {allocation.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={allocation} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">{allocation.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any) => formatCurrency(v)} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {allocation.map(a => (
                      <div key={a.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} /><span className="text-xs text-text-secondary">{a.name}</span></div>
                        <span className="text-xs font-medium text-text">{((a.value / totalCurrent) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-text-muted text-xs">No asset records logged yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <button onClick={() => setFilterType('all')} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterType === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>All</button>
        {INVESTMENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterType === t.value ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>{t.label}</button>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Type</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Invested</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Current</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">Returns</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3 w-20"></th>
            </tr></thead>
            <tbody>
              {filteredInvestments.map(inv => {
                const gain = inv.currentValue - inv.investedAmount;
                const ret = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
                const typeMeta = INVESTMENT_TYPES.find(t => t.value === inv.type);
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${typeMeta?.color}15` }}>
                          {gain >= 0 ? <TrendingUp className="w-4 h-4" style={{ color: typeMeta?.color }} /> : <TrendingDown className="w-4 h-4 text-danger" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text">{inv.name}</span>
                            {inv.isSIP && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-info-muted text-info">
                                <RefreshCw className="w-2.5 h-2.5" />
                                SIP
                              </span>
                            )}
                          </div>
                          {inv.isSIP && inv.sipAmount && (
                            <span className="text-[11px] text-text-muted">
                              ₹{inv.sipAmount.toLocaleString('en-IN')}/mo · {inv.monthsElapsed || '—'} months
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{typeMeta?.label}</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary text-right">{formatCurrency(inv.investedAmount)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-text text-right">
                      {formatCurrency(inv.currentValue)}
                      {inv.isSIP && (
                        <span className="block text-[10px] text-text-muted">est. @12% p.a.</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-md',
                          gain >= 0
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-danger/10 text-danger border border-danger/20'
                        )}>
                          {gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatPercentage(ret)}
                        </span>
                        <span className={cn('text-[11px] font-medium', gain >= 0 ? 'text-success/80' : 'text-danger/80')}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInvestments.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-text-muted">
                    No investment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Add Investment</h2>
              <button onClick={() => { setShowForm(false); setIsSIP(false); }} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. SBI Bluechip Fund" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">
                  {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Investment Mode Toggle */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Investment Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSIP(false)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-all cursor-pointer',
                      !isSIP
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'border-border text-text-secondary hover:bg-surface-hover'
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    One-time
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSIP(true)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-all cursor-pointer',
                      isSIP
                        ? 'bg-info-muted border-info/30 text-info'
                        : 'border-border text-text-secondary hover:bg-surface-hover'
                    )}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Monthly SIP
                  </button>
                </div>
              </div>

              {isSIP ? (
                <>
                  {/* SIP Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">SIP Amount (₹/month)</label>
                      <input type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)} required placeholder="500" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">SIP Start Date</label>
                      <input type="date" value={sipStartDate} onChange={e => setSipStartDate(e.target.value)} required className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>

                  {/* SIP Preview */}
                  {sipPreview && Number(sipAmount) > 0 && (
                    <div className="bg-info-muted border border-info/20 rounded-xl p-4 space-y-2 animate-slide-up">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarClock className="w-4 h-4 text-info" />
                        <span className="text-xs font-semibold text-info uppercase tracking-wider">SIP Preview</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Months</p>
                          <p className="text-sm font-bold text-text">{sipPreview.monthsElapsed}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Invested</p>
                          <p className="text-sm font-bold text-text">{formatCurrency(sipPreview.investedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Est. Value</p>
                          <p className="text-sm font-bold text-success">{formatCurrency(sipPreview.currentValue)}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">*Estimated at 12% annual return (avg mutual fund benchmark)</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* One-time Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Invested (₹)</label>
                      <input type="number" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Current Value (₹)</label>
                      <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} required placeholder="0" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Purchase details..." rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50 resize-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">
                {isSIP ? 'Start SIP' : 'Add Investment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
