'use client';

import { useState, useEffect, useMemo } from 'react';
import HealthGauge from '@/components/dashboard/health-gauge';
import { useData } from '@/components/dashboard/data-provider';
import { HeartPulse, TrendingUp, Shield, PiggyBank, BarChart3, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

const factorIcons: Record<string, any> = {
  savingsRate: PiggyBank,
  debtRatio: Shield,
  emergencyFund: Shield,
  investmentDiversity: BarChart3,
  spendingBehavior: ShoppingCart,
};

const factorLabels: Record<string, string> = {
  savingsRate: 'Savings Rate',
  debtRatio: 'Debt Ratio',
  emergencyFund: 'Emergency Fund',
  investmentDiversity: 'Investment Diversity',
  spendingBehavior: 'Spending Behavior',
};

const factorDescriptions: Record<string, string> = {
  savingsRate: 'Percentage of income saved each month',
  debtRatio: 'Your total debt compared to assets',
  emergencyFund: 'Months of expenses covered by emergency savings',
  investmentDiversity: 'Number of different asset classes in portfolio',
  spendingBehavior: 'How well you stay within budget',
};

export default function HealthPage() {
  const { incomes, expenses, accounts, investments, lendings, borrowings, goals, loading, refetch: loadData } = useData();

  useEffect(() => {
    loadData();
  }, []);

  const scoreData = useMemo(() => {
    // Calculate totals
    const bankAndWalletBalance = accounts.reduce((sum: number, a: any) => sum + a.balance, 0);
    const investmentsValue = investments.reduce((sum: number, i: any) => sum + i.currentValue, 0);
    const outstandingLent = lendings.reduce((sum: number, l: any) => sum + l.remainingBalance, 0);
    const goalsSaved = goals.reduce((sum: number, g: any) => sum + g.currentAmount, 0);
    const totalAssets = bankAndWalletBalance + investmentsValue + outstandingLent + goalsSaved;
    const totalLiabilities = borrowings.reduce((sum: number, b: any) => sum + b.remainingBalance, 0);

    // Monthly averages
    const now = new Date();
    const thisMonthIncomes = incomes.filter((i: any) => {
      const d = new Date(i.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const monthlyIncome = thisMonthIncomes.reduce((sum: number, i: any) => sum + i.amount, 0) || (incomes.length ? incomes.reduce((sum: number, i: any) => sum + i.amount, 0) / 6 : 0);
    const monthlyExpenses = thisMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0) || (expenses.length ? expenses.reduce((sum: number, e: any) => sum + e.amount, 0) / 6 : 0);

    // 1. Savings Rate
    const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)) : 0;
    const savingsScore = monthlyIncome > 0 ? Math.min(100, Math.max(0, Math.round(savingsRate * 2.5))) : 0;

    // 2. Debt Ratio
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;
    const debtScore = totalAssets > 0 ? Math.min(100, Math.max(0, 100 - Math.round(debtRatio * 300))) : 0;

    // 3. Emergency Fund
    const monthsOfEmergency = monthlyExpenses > 0 ? Number((bankAndWalletBalance / monthlyExpenses).toFixed(1)) : 0;
    const emergencyScore = bankAndWalletBalance > 0 && monthlyExpenses > 0 ? Math.min(100, Math.max(0, Math.round(monthsOfEmergency * 16.6))) : 0;

    // 4. Investment Diversity
    const assetTypes = new Set(investments.map((i: any) => i.type));
    const distinctTypes = assetTypes.size;
    const diversityScore = investments.length > 0 ? Math.min(100, Math.max(0, distinctTypes * 25)) : 0;

    // 5. Spending Behavior
    const expenseToIncomeRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) : 0;
    const spendingScore = monthlyIncome > 0 ? Math.min(100, Math.max(0, 100 - Math.round(Math.max(0, expenseToIncomeRatio - 0.4) * 100))) : 0;

    const hasData = totalAssets > 0 || totalLiabilities > 0 || monthlyIncome > 0 || monthlyExpenses > 0;

    // Composite Score
    const compositeScore = hasData
      ? Math.round((savingsScore + debtScore + emergencyScore + diversityScore + spendingScore) / 5)
      : 0;

    // Recommendations generator
    const recommendations: string[] = [];

    if (!hasData) {
      recommendations.push('Get started by adding your bank accounts, wallets, or investments in the Accounts section.');
      recommendations.push('Log your recurring monthly income sources to enable detailed budget and savings analysis.');
      recommendations.push('Track your daily expenses regularly to identify category breakdowns and optimize spending habits.');
    } else {
      if (savingsScore < 60) {
        recommendations.push('Increase your savings rate to at least 25% by automating savings rules or trimming subscription costs.');
      } else {
        recommendations.push('Great savings discipline! Consider moving extra liquidity into high-yield accounts or investments.');
      }

      if (emergencyScore < 80) {
        recommendations.push(`Your liquid buffer covers ${monthsOfEmergency} months of expenses. Focus on building a 6-month buffer in bank accounts.`);
      }

      if (totalLiabilities > 0 && debtScore < 80) {
        recommendations.push(`Outstanding liabilities are at ${formatCurrency(totalLiabilities)}. Prioritize paying down highest-interest loans first.`);
      }

      if (diversityScore < 60) {
        recommendations.push('Diversify your holdings. You are active in few asset classes — consider ETFs, Gold, or Mutual Funds to hedge risk.');
      }

      if (recommendations.length < 3) {
        recommendations.push('Review your investment CAGR quarterly to ensure it beats the national inflation benchmarks.');
        recommendations.push('Your parameters look healthy. Maintain this momentum and review your long term goals in Goals section.');
      }
    }

    return {
      score: compositeScore,
      factors: {
        savingsRate: { score: savingsScore, value: savingsRate },
        debtRatio: { score: debtScore, value: Math.round(debtRatio * 100) },
        emergencyFund: { score: emergencyScore, months: monthsOfEmergency },
        investmentDiversity: { score: diversityScore, value: distinctTypes },
        spendingBehavior: { score: spendingScore, value: Math.round(expenseToIncomeRatio * 100) },
      },
      recommendations: recommendations.slice(0, 4),
    };
  }, [incomes, expenses, accounts, investments, lendings, borrowings, goals]);

  const getColor = (s: number) => s >= 80 ? '#22C55E' : s >= 60 ? '#00C896' : s >= 40 ? '#F59E0B' : '#EF4444';

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
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><HeartPulse className="w-6 h-6 text-primary" /> Financial Health Score</h1>
        <p className="text-sm text-text-muted mt-1">Comprehensive analysis of your financial wellness</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Gauge */}
        <div className="lg:col-span-1">
          <HealthGauge score={scoreData.score} size="lg" />
        </div>

        {/* Factor Breakdown */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold text-text mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(scoreData.factors).map(([key, factor]: [string, any]) => {
              const Icon = factorIcons[key] || TrendingUp;
              const color = getColor(factor.score);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <div>
                        <p className="text-sm font-medium text-text">{factorLabels[key]}</p>
                        <p className="text-[10px] text-text-muted">{factorDescriptions[key]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color }}>{factor.score}/100</span>
                    </div>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${factor.score}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" /> Recommendations
        </h3>
        <div className="space-y-3">
          {scoreData.recommendations.map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-text-secondary">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
