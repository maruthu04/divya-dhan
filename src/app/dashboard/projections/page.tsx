'use client';

import { useState, useMemo, useEffect } from 'react';
import { getInvestments } from '@/actions/investments';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { LineChart as LineChartIcon, Calculator, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export default function ProjectionsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlySIP, setMonthlySIP] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [currentInvestments, setCurrentInvestments] = useState(0);
  const [years, setYears] = useState(20);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const investments = await getInvestments();
        const totalCurrent = investments.reduce((sum: number, i: any) => sum + i.currentValue, 0);
        setCurrentInvestments(totalCurrent || 100000); // default to 1L if none
      } catch (err) {
        console.error('Failed to get investment totals for projections', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const projectionData = useMemo(() => {
    const data = [];
    let invested = currentInvestments;
    let totalInvested = currentInvestments;
    const monthlyRate = expectedReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      data.push({
        year: `Year ${year}`,
        investmentValue: Math.round(invested),
        totalInvested: Math.round(totalInvested),
        returns: Math.round(invested - totalInvested),
      });
      // Compound monthly for next year
      for (let month = 0; month < 12; month++) {
        invested = invested * (1 + monthlyRate) + monthlySIP;
        totalInvested += monthlySIP;
      }
    }
    return data;
  }, [monthlySIP, expectedReturn, currentInvestments, years]);

  const finalValue = projectionData[projectionData.length - 1]?.investmentValue || 0;
  const totalInvested = projectionData[projectionData.length - 1]?.totalInvested || 0;
  const totalReturns = finalValue - totalInvested;

  // Milestones
  const milestones = [
    { label: '₹50L', value: 5000000 },
    { label: '₹1Cr', value: 10000000 },
    { label: '₹5Cr', value: 50000000 },
  ].filter(m => m.value <= finalValue * 1.2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><LineChartIcon className="w-6 h-6 text-primary" /> Future Wealth Projection</h1>
        <p className="text-sm text-text-muted mt-1">Simulate your wealth growth over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Parameters</h3>

          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-text-secondary">Monthly SIP</label><span className="text-xs font-bold text-primary">{formatCurrency(monthlySIP)}</span></div>
            <input type="range" min={1000} max={200000} step={1000} value={monthlySIP} onChange={e => setMonthlySIP(+e.target.value)} className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>₹1K</span><span>₹2L</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-text-secondary">Expected Annual Return</label><span className="text-xs font-bold text-primary">{expectedReturn}%</span></div>
            <input type="range" min={4} max={25} step={0.5} value={expectedReturn} onChange={e => setExpectedReturn(+e.target.value)} className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>4%</span><span>25%</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-text-secondary">Current Investments</label><span className="text-xs font-bold text-primary">{formatCompactCurrency(currentInvestments)}</span></div>
            <input type="range" min={0} max={10000000} step={50000} value={currentInvestments} onChange={e => setCurrentInvestments(+e.target.value)} className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>₹0</span><span>₹1Cr</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-text-secondary">Time Horizon</label><span className="text-xs font-bold text-primary">{years} years</span></div>
            <input type="range" min={1} max={30} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>1 yr</span><span>30 yrs</span></div>
          </div>

          {/* Results */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-[10px] text-text-muted uppercase">Projected Wealth</p>
              <p className="text-xl font-bold text-primary mt-1">{formatCompactCurrency(finalValue)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="text-[10px] text-text-muted uppercase">Invested</p>
                <p className="text-sm font-bold text-text mt-1">{formatCompactCurrency(totalInvested)}</p>
              </div>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-[10px] text-text-muted uppercase">Returns</p>
                <p className="text-sm font-bold text-success mt-1">{formatCompactCurrency(totalReturns)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold text-text mb-4">Wealth Growth Projection</h3>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00C896" stopOpacity={0.3} /><stop offset="95%" stopColor="#00C896" stopOpacity={0} /></linearGradient>
                  <linearGradient id="invGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} /><stop offset="95%" stopColor="#38BDF8" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} interval={Math.max(1, Math.floor(years / 10))} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => formatCompactCurrency(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '8px' }} formatter={(v: any, name: any) => [formatCompactCurrency(v), name === 'investmentValue' ? 'Total Value' : name === 'totalInvested' ? 'Invested' : 'Returns']} />
                <Legend iconType="square" wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} formatter={v => v === 'investmentValue' ? 'Total Value' : v === 'totalInvested' ? 'Invested' : 'Returns'} />
                {milestones.map(m => (
                  <ReferenceLine key={m.label} y={m.value} stroke="#374151" strokeDasharray="5 5" label={{ value: m.label, fill: '#64748B', fontSize: 10, position: 'left' }} />
                ))}
                <Area type="monotone" dataKey="investmentValue" stroke="#00C896" strokeWidth={2.5} fill="url(#projGrad)" dot={false} />
                <Area type="monotone" dataKey="totalInvested" stroke="#38BDF8" strokeWidth={1.5} fill="url(#invGrad2)" dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
