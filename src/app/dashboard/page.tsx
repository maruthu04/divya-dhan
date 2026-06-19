'use client';

import { useState, useEffect, useCallback } from 'react';
import StatCard from '@/components/dashboard/stat-card';
import NetWorthChart from '@/components/dashboard/net-worth-chart';
import CashFlowChart from '@/components/dashboard/cash-flow-chart';
import ExpenseBreakdown from '@/components/dashboard/expense-breakdown';
import HealthGauge from '@/components/dashboard/health-gauge';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import TodayReport from '@/components/dashboard/today-report';
import QuickAddPanel from '@/components/dashboard/quick-add-panel';
import WeeklyOverview from '@/components/dashboard/weekly-overview';
import { getIncomes } from '@/actions/income';
import { getExpenses } from '@/actions/expenses';
import { getAccounts } from '@/actions/accounts';
import { getInvestments } from '@/actions/investments';
import { getLendings, getBorrowings } from '@/actions/debt';
import { getCurrentUser } from '@/actions/auth';
import { getGoals } from '@/actions/goals';
import {
  Wallet, TrendingUp, TrendingDown, ArrowDownLeft,
  ArrowUpRight, PiggyBank, BarChart3, Activity, Loader2
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

// ─── Helpers ──────────────────────────────────────────────────
function isSameDay(d1: Date | string, d2: Date) {
  const d = typeof d1 === 'string' ? new Date(d1) : d1;
  if (typeof d1 === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d1)) {
    const [year, month, day] = d1.split('-').map(Number);
    return year === d2.getFullYear() &&
      (month - 1) === d2.getMonth() &&
      day === d2.getDate();
  }
  return d.getFullYear() === d2.getFullYear() &&
    d.getMonth() === d2.getMonth() &&
    d.getDate() === d2.getDate();
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday = 1
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isInWeek(date: Date, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return date >= weekStart && date <= weekEnd;
}

function isDateInWeek(dateInput: Date | string, weekStart: Date) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return isInWeek(localDate, weekStart);
  }
  return isInWeek(d, weekStart);
}

function isSameMonth(dateInput: Date | string, targetMonth: number, targetYear: number) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    return (month - 1) === targetMonth && year === targetYear;
  }
  return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    cashFlow: 0,
    investmentPerformance: 0,
    recentTransactions: [],
    netWorthHistory: [],
    cashFlowHistory: [],
    expenseBreakdown: [],
    healthScore: 75,
    userName: 'User',
    // Daily
    todayIncome: 0,
    todayExpenses: 0,
    todayBorrowed: 0,
    todayLent: 0,
    todayBorrowedRemaining: 0,
    todayLentRemaining: 0,
    todayTransactions: [],
    // Weekly
    weeklyIncome: 0,
    weeklyExpenses: 0,
    weeklyBorrowed: 0,
    weeklyLent: 0,
    weeklyBorrowedRemaining: 0,
    weeklyLentRemaining: 0,
    dailyBreakdown: [],
    weekLabel: '',
    lastWeekIncome: 0,
    lastWeekExpenses: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [incomes, expenses, accounts, investments, lendings, borrowings, userSession, goals] = await Promise.all([
        getIncomes(),
        getExpenses(),
        getAccounts(),
        getInvestments(),
        getLendings(),
        getBorrowings(),
        getCurrentUser(),
        getGoals(),
      ]);

      // ─── Assets & Liabilities ─────────────────────────────────
      const bankAndWalletBalance = accounts.reduce((sum: number, a: any) => sum + a.balance, 0);
      const investmentsValue = investments.reduce((sum: number, i: any) => sum + i.currentValue, 0);
      const investmentsInvested = investments.reduce((sum: number, i: any) => sum + i.investedAmount, 0);
      const outstandingLent = lendings.reduce((sum: number, l: any) => sum + l.remainingBalance, 0);
      const goalsSaved = goals.reduce((sum: number, g: any) => sum + g.currentAmount, 0);
      const totalAssets = bankAndWalletBalance + investmentsValue + outstandingLent + goalsSaved;

      const totalLiabilities = borrowings.reduce((sum: number, b: any) => sum + b.remainingBalance, 0);
      const netWorth = totalAssets - totalLiabilities;

      // ─── Gather all borrowing repayments and lending payments ───
      const allBorrowingRepayments: any[] = [];
      borrowings.forEach((b: any) => {
        if (b.repayments && Array.isArray(b.repayments)) {
          b.repayments.forEach((r: any) => {
            allBorrowingRepayments.push({
              id: r.id,
              borrowingId: b.id,
              lenderName: b.lenderName,
              amount: r.amount,
              date: r.date,
              note: r.note,
            });
          });
        }
      });

      const allLendingPayments: any[] = [];
      lendings.forEach((l: any) => {
        if (l.payments && Array.isArray(l.payments)) {
          l.payments.forEach((p: any) => {
            allLendingPayments.push({
              id: p.id,
              lendingId: l.id,
              borrowerName: l.borrowerName,
              amount: p.amount,
              date: p.date,
              note: p.note,
            });
          });
        }
      });

      // ─── Monthly ──────────────────────────────────────────────
      const now = new Date();
      const thisMonthIncomes = incomes.filter((i: any) => {
        const d = new Date(i.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const thisMonthExpenses = expenses.filter((e: any) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const thisMonthLendingPayments = allLendingPayments.filter((p: any) =>
        isSameMonth(p.date, now.getMonth(), now.getFullYear())
      );
      const thisMonthBorrowingRepayments = allBorrowingRepayments.filter((r: any) =>
        isSameMonth(r.date, now.getMonth(), now.getFullYear())
      );

      const monthlyIncome = thisMonthIncomes.reduce((sum: number, i: any) => sum + i.amount, 0) +
        thisMonthLendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      const monthlyExpenses = thisMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0) +
        thisMonthBorrowingRepayments.reduce((sum: number, r: any) => sum + r.amount, 0);

      const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
      const cashFlow = monthlyIncome - monthlyExpenses;

      const investmentPerformance = investmentsInvested > 0
        ? Number((((investmentsValue - investmentsInvested) / investmentsInvested) * 100).toFixed(1))
        : 0;

      // ─── TODAY'S DATA ─────────────────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayIncomes = incomes.filter((i: any) => isSameDay(i.date, today));
      const todayExpensesList = expenses.filter((e: any) => isSameDay(e.date, today));
      const todayBorrowings = borrowings.filter((b: any) => isSameDay(b.createdAt, today));
      const todayLendings = lendings.filter((l: any) => isSameDay(l.createdAt, today));

      const todayLendingPayments = allLendingPayments.filter((p: any) => isSameDay(p.date, today));
      const todayBorrowingRepayments = allBorrowingRepayments.filter((r: any) => isSameDay(r.date, today));

      const todayIncome = todayIncomes.reduce((sum: number, i: any) => sum + i.amount, 0) +
        todayLendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      const todayExpensesTotal = todayExpensesList.reduce((sum: number, e: any) => sum + e.amount, 0) +
        todayBorrowingRepayments.reduce((sum: number, r: any) => sum + r.amount, 0);

      const todayBorrowed = todayBorrowings.reduce((sum: number, b: any) => sum + b.amount, 0);
      const todayLent = todayLendings.reduce((sum: number, l: any) => sum + l.amount, 0);
      const todayBorrowedRemaining = todayBorrowings.reduce((sum: number, b: any) => sum + b.remainingBalance, 0);
      const todayLentRemaining = todayLendings.reduce((sum: number, l: any) => sum + l.remainingBalance, 0);

      // Merge today's transactions for the timeline
      const todayTransactions = [
        ...todayIncomes.map((i: any) => ({
          id: i.id, type: 'income' as const, description: i.description,
          amount: i.amount, category: i.source, date: i.date,
        })),
        ...todayExpensesList.map((e: any) => ({
          id: e.id, type: 'expense' as const, description: e.description,
          amount: e.amount, category: e.category, date: e.date,
        })),
        ...todayBorrowings.map((b: any) => ({
          id: b.id, type: 'borrowing' as const, description: `Borrowed from ${b.lenderName}`,
          amount: b.amount, category: 'borrowing', date: b.createdAt,
        })),
        ...todayLendings.map((l: any) => ({
          id: l.id, type: 'lending' as const, description: `Lent to ${l.borrowerName}`,
          amount: l.amount, category: 'lending', date: l.createdAt,
        })),
        ...todayBorrowingRepayments.map((r: any) => ({
          id: r.id, type: 'expense' as const, description: `Repaid to ${r.lenderName}`,
          amount: r.amount, category: 'Repayment', date: r.date,
        })),
        ...todayLendingPayments.map((p: any) => ({
          id: p.id, type: 'income' as const, description: `Received from ${p.borrowerName}`,
          amount: p.amount, category: 'Lending Payment', date: p.date,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // ─── THIS WEEK'S DATA ────────────────────────────────────
      const thisMonday = getMonday(new Date());
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);

      const thisWeekIncomes = incomes.filter((i: any) => isDateInWeek(i.date, thisMonday));
      const thisWeekExpenses = expenses.filter((e: any) => isDateInWeek(e.date, thisMonday));
      const thisWeekBorrowings = borrowings.filter((b: any) => isDateInWeek(b.createdAt, thisMonday));
      const thisWeekLendings = lendings.filter((l: any) => isDateInWeek(l.createdAt, thisMonday));

      const thisWeekLendingPayments = allLendingPayments.filter((p: any) => isDateInWeek(p.date, thisMonday));
      const thisWeekBorrowingRepayments = allBorrowingRepayments.filter((r: any) => isDateInWeek(r.date, thisMonday));

      const weeklyIncome = thisWeekIncomes.reduce((sum: number, i: any) => sum + i.amount, 0) +
        thisWeekLendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      const weeklyExpensesTotal = thisWeekExpenses.reduce((sum: number, e: any) => sum + e.amount, 0) +
        thisWeekBorrowingRepayments.reduce((sum: number, r: any) => sum + r.amount, 0);

      const weeklyBorrowed = thisWeekBorrowings.reduce((sum: number, b: any) => sum + b.amount, 0);
      const weeklyLent = thisWeekLendings.reduce((sum: number, l: any) => sum + l.amount, 0);
      const weeklyBorrowedRemaining = thisWeekBorrowings.reduce((sum: number, b: any) => sum + b.remainingBalance, 0);
      const weeklyLentRemaining = thisWeekLendings.reduce((sum: number, l: any) => sum + l.remainingBalance, 0);

      // Last week comparison
      const lastWeekIncomes = incomes.filter((i: any) => isDateInWeek(i.date, lastMonday));
      const lastWeekExpensesList = expenses.filter((e: any) => isDateInWeek(e.date, lastMonday));
      const lastWeekLendingPayments = allLendingPayments.filter((p: any) => isDateInWeek(p.date, lastMonday));
      const lastWeekBorrowingRepayments = allBorrowingRepayments.filter((r: any) => isDateInWeek(r.date, lastMonday));

      const lastWeekIncome = lastWeekIncomes.reduce((sum: number, i: any) => sum + i.amount, 0) +
        lastWeekLendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      const lastWeekExpenses = lastWeekExpensesList.reduce((sum: number, e: any) => sum + e.amount, 0) +
        lastWeekBorrowingRepayments.reduce((sum: number, r: any) => sum + r.amount, 0);

      // Build 7-day breakdown (Mon–Sun)
      const dailyBreakdown = DAY_NAMES.map((dayName, idx) => {
        const dayDate = new Date(thisMonday);
        dayDate.setDate(thisMonday.getDate() + idx);

        const dayIncomes = incomes.filter((i: any) => isSameDay(i.date, dayDate));
        const dayExpenses = expenses.filter((e: any) => isSameDay(e.date, dayDate));
        const dayBorrowings = borrowings.filter((b: any) => isSameDay(b.createdAt, dayDate));

        const dayLendingPayments = allLendingPayments.filter((p: any) => isSameDay(p.date, dayDate));
        const dayBorrowingRepayments = allBorrowingRepayments.filter((r: any) => isSameDay(r.date, dayDate));

        return {
          day: dayName,
          date: dayDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          income: dayIncomes.reduce((s: number, i: any) => s + i.amount, 0) +
            dayLendingPayments.reduce((s: number, p: any) => s + p.amount, 0),
          expenses: dayExpenses.reduce((s: number, e: any) => s + e.amount, 0) +
            dayBorrowingRepayments.reduce((s: number, r: any) => s + r.amount, 0),
          borrowings: dayBorrowings.reduce((s: number, b: any) => s + b.amount, 0),
        };
      });

      // Week label
      const thisSunday = new Date(thisMonday);
      thisSunday.setDate(thisMonday.getDate() + 6);
      const weekLabel = `${thisMonday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${thisSunday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;

      // ─── EXISTING: Recent Transactions ────────────────────────
      const recentTx = [
        ...incomes.map((i: any) => ({
          id: i.id, type: 'income' as const, description: i.description,
          amount: i.amount, category: i.source, date: i.date,
        })),
        ...expenses.map((e: any) => ({
          id: e.id, type: 'expense' as const, description: e.description,
          amount: e.amount, category: e.category, date: e.date,
        })),
        ...allBorrowingRepayments.map((r: any) => ({
          id: r.id, type: 'expense' as const, description: `Repaid to ${r.lenderName}`,
          amount: r.amount, category: 'Repayment', date: r.date,
        })),
        ...allLendingPayments.map((p: any) => ({
          id: p.id, type: 'income' as const, description: `Received from ${p.borrowerName}`,
          amount: p.amount, category: 'Lending Payment', date: p.date,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

      // Expense Breakdown by Category
      const breakdownMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        breakdownMap[e.category] = (breakdownMap[e.category] || 0) + e.amount;
      });

      const expenseBreakdown = Object.entries(breakdownMap).map(([catVal, amount]) => {
        const catMeta = EXPENSE_CATEGORIES.find(c => c.value === catVal);
        const categoryLabel = catMeta?.label || catVal.charAt(0).toUpperCase() + catVal.slice(1);
        return {
          category: categoryLabel,
          name: categoryLabel,
          amount,
          color: catMeta?.color || '#64748B',
        };
      });

      // ─── EXISTING: Charts ─────────────────────────────────────
      const netWorthHistory = [];
      const cashFlowHistory = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mName = months[d.getMonth()];
        const year = d.getFullYear();

        netWorthHistory.push({
          month: mName,
          value: i === 0 ? netWorth : 0,
        });

        const mIncomes = incomes.filter((inc: any) => {
          const incDate = new Date(inc.date);
          return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === year;
        });

        const mExpenses = expenses.filter((exp: any) => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === year;
        });

        const mLendingPayments = allLendingPayments.filter((p: any) =>
          isSameMonth(p.date, d.getMonth(), year)
        );
        const mBorrowingRepayments = allBorrowingRepayments.filter((r: any) =>
          isSameMonth(r.date, d.getMonth(), year)
        );

        const incSum = mIncomes.reduce((sum: number, item: any) => sum + item.amount, 0) +
          mLendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

        const expSum = mExpenses.reduce((sum: number, item: any) => sum + item.amount, 0) +
          mBorrowingRepayments.reduce((sum: number, r: any) => sum + r.amount, 0);

        cashFlowHistory.push({
          month: mName,
          income: incSum,
          expenses: expSum,
        });
      }

      // ─── Health Score ─────────────────────────────────────────
      const savingsScore = monthlyIncome > 0 ? Math.min(100, Math.max(0, Math.round(savingsRate * 2.5))) : 0;
      const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;
      const debtScore = totalAssets > 0 ? Math.min(100, Math.max(0, 100 - Math.round(debtRatio * 300))) : 0;
      const monthsOfEmergency = monthlyExpenses > 0 ? Number((bankAndWalletBalance / monthlyExpenses).toFixed(1)) : 0;
      const emergencyScore = bankAndWalletBalance > 0 && monthlyExpenses > 0 ? Math.min(100, Math.max(0, Math.round(monthsOfEmergency * 16.6))) : 0;
      const assetTypes = new Set(investments.map((i: any) => i.type));
      const distinctTypes = assetTypes.size;
      const diversityScore = investments.length > 0 ? Math.min(100, Math.max(0, distinctTypes * 25)) : 0;
      const expenseToIncomeRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) : 0;
      const spendingScore = monthlyIncome > 0 ? Math.min(100, Math.max(0, 100 - Math.round(Math.max(0, expenseToIncomeRatio - 0.4) * 100))) : 0;

      const hasData = totalAssets > 0 || totalLiabilities > 0 || monthlyIncome > 0 || monthlyExpenses > 0;
      const healthScore = hasData
        ? Math.round((savingsScore + debtScore + emergencyScore + diversityScore + spendingScore) / 5)
        : 0;

      setDashboardData({
        netWorth,
        totalAssets,
        totalLiabilities,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        cashFlow,
        investmentPerformance,
        recentTransactions: recentTx,
        netWorthHistory,
        cashFlowHistory,
        expenseBreakdown,
        healthScore: Math.min(100, healthScore),
        userName: userSession?.name || 'User',
        // Daily
        todayIncome,
        todayExpenses: todayExpensesTotal,
        todayBorrowed,
        todayLent,
        todayBorrowedRemaining,
        todayLentRemaining,
        todayTransactions,
        // Weekly
        weeklyIncome,
        weeklyExpenses: weeklyExpensesTotal,
        weeklyBorrowed,
        weeklyLent,
        weeklyBorrowedRemaining,
        weeklyLentRemaining,
        dailyBreakdown,
        weekLabel,
        lastWeekIncome,
        lastWeekExpenses,
      });
    } catch (err) {
      console.error('Failed to compute dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, <span className="gradient-text">{dashboardData.userName || 'User'}</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here&apos;s your financial overview for today
        </p>
      </div>

      {/* ═══════ TODAY'S REPORT + QUICK ADD ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <TodayReport
            todayIncome={dashboardData.todayIncome}
            todayExpenses={dashboardData.todayExpenses}
            todayBorrowed={dashboardData.todayBorrowed}
            todayLent={dashboardData.todayLent}
            todayBorrowedRemaining={dashboardData.todayBorrowedRemaining}
            todayLentRemaining={dashboardData.todayLentRemaining}
            todayTransactions={dashboardData.todayTransactions}
          />
        </div>
        <div className="lg:col-span-2">
          <QuickAddPanel onTransactionAdded={loadData} />
        </div>
      </div>

      {/* ═══════ WEEKLY OVERVIEW ═══════ */}
      <WeeklyOverview
        weeklyIncome={dashboardData.weeklyIncome}
        weeklyExpenses={dashboardData.weeklyExpenses}
        weeklyBorrowed={dashboardData.weeklyBorrowed}
        weeklyLent={dashboardData.weeklyLent}
        weeklyBorrowedRemaining={dashboardData.weeklyBorrowedRemaining}
        weeklyLentRemaining={dashboardData.weeklyLentRemaining}
        dailyBreakdown={dashboardData.dailyBreakdown}
        weekLabel={dashboardData.weekLabel}
        lastWeekIncome={dashboardData.lastWeekIncome}
        lastWeekExpenses={dashboardData.lastWeekExpenses}
      />

      {/* ═══════ MONTHLY KPI CARDS ═══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Worth"
          value={dashboardData.netWorth}
          format="compact"
          icon={<Wallet className="w-5 h-5" />}
          color="#00C896"
          delay={0}
        />
        <StatCard
          title="Monthly Income"
          value={dashboardData.monthlyIncome}
          format="compact"
          icon={<ArrowDownLeft className="w-5 h-5" />}
          color="#22C55E"
          delay={50}
        />
        <StatCard
          title="Monthly Expenses"
          value={dashboardData.monthlyExpenses}
          format="compact"
          icon={<ArrowUpRight className="w-5 h-5" />}
          color="#EF4444"
          delay={100}
        />
        <StatCard
          title="Savings Rate"
          value={dashboardData.savingsRate}
          format="percentage"
          icon={<PiggyBank className="w-5 h-5" />}
          color="#38BDF8"
          delay={150}
        />
      </div>

      {/* Second Row: Assets, Liabilities, Cash Flow, Investment Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={dashboardData.totalAssets}
          format="compact"
          icon={<TrendingUp className="w-5 h-5" />}
          color="#22C55E"
          delay={200}
        />
        <StatCard
          title="Total Liabilities"
          value={dashboardData.totalLiabilities}
          format="compact"
          icon={<TrendingDown className="w-5 h-5" />}
          color="#F59E0B"
          delay={250}
        />
        <StatCard
          title="Cash Flow"
          value={dashboardData.cashFlow}
          format="compact"
          icon={<Activity className="w-5 h-5" />}
          color="#8B5CF6"
          delay={300}
        />
        <StatCard
          title="Investment Returns"
          value={dashboardData.investmentPerformance}
          format="percentage"
          icon={<BarChart3 className="w-5 h-5" />}
          color="#F97316"
          delay={350}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetWorthChart data={dashboardData.netWorthHistory} />
        <CashFlowChart data={dashboardData.cashFlowHistory} />
      </div>

      {/* Bottom Row: Expense Breakdown + Health Score + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ExpenseBreakdown data={dashboardData.expenseBreakdown} />
        <HealthGauge score={dashboardData.healthScore} />
        <RecentTransactions transactions={dashboardData.recentTransactions} />
      </div>
    </div>
  );
}
