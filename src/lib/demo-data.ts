// ============================================
// DivyaDhan — Comprehensive Demo Data
// ============================================

import type {
  Income, Expense, BankAccount, Lending, Borrowing,
  Investment, Goal, Note, NetWorthSnapshot, HealthScore,
  MonthlyReport, DashboardData
} from '@/types';

// ---- Helpers ----
let idCounter = 1;
const id = () => `demo-${idCounter++}`;
const userId = 'demo-user';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

// ============ INCOME ============
export const demoIncomes: Income[] = [
  { id: id(), userId, source: 'salary', amount: 125000, description: 'Monthly Salary - TechCorp', date: daysAgo(2), recurring: true, createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { id: id(), userId, source: 'freelance', amount: 35000, description: 'UI/UX Project - StartupXYZ', date: daysAgo(5), recurring: false, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: id(), userId, source: 'trading', amount: 12500, description: 'Stock Trading Profits', date: daysAgo(8), recurring: false, createdAt: daysAgo(8), updatedAt: daysAgo(8) },
  { id: id(), userId, source: 'rental', amount: 18000, description: 'Apartment Rental Income', date: daysAgo(10), recurring: true, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: id(), userId, source: 'interest', amount: 3200, description: 'FD Interest - HDFC', date: daysAgo(15), recurring: true, createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { id: id(), userId, source: 'dividend', amount: 5800, description: 'Quarterly Dividend - Infosys', date: daysAgo(20), recurring: false, createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { id: id(), userId, source: 'salary', amount: 125000, description: 'Monthly Salary - TechCorp', date: daysAgo(32), recurring: true, createdAt: daysAgo(32), updatedAt: daysAgo(32) },
  { id: id(), userId, source: 'freelance', amount: 22000, description: 'Logo Design - BrandCo', date: daysAgo(40), recurring: false, createdAt: daysAgo(40), updatedAt: daysAgo(40) },
  { id: id(), userId, source: 'business', amount: 45000, description: 'Consulting Revenue', date: daysAgo(45), recurring: false, createdAt: daysAgo(45), updatedAt: daysAgo(45) },
  { id: id(), userId, source: 'rental', amount: 18000, description: 'Apartment Rental Income', date: daysAgo(40), recurring: true, createdAt: daysAgo(40), updatedAt: daysAgo(40) },
];

// ============ EXPENSES ============
export const demoExpenses: Expense[] = [
  { id: id(), userId, category: 'rent', amount: 25000, description: 'Monthly House Rent', date: daysAgo(1), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { id: id(), userId, category: 'food', amount: 4500, description: 'Swiggy Orders', merchant: 'Swiggy', date: daysAgo(1), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { id: id(), userId, category: 'food', amount: 2800, description: 'Groceries - BigBasket', merchant: 'BigBasket', date: daysAgo(3), createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { id: id(), userId, category: 'shopping', amount: 8500, description: 'Amazon Shopping', merchant: 'Amazon', date: daysAgo(4), createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { id: id(), userId, category: 'bills', amount: 3200, description: 'Electricity Bill', date: daysAgo(5), createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: id(), userId, category: 'transport', amount: 2100, description: 'Uber & Metro', merchant: 'Uber', date: daysAgo(6), createdAt: daysAgo(6), updatedAt: daysAgo(6) },
  { id: id(), userId, category: 'entertainment', amount: 999, description: 'Netflix Subscription', merchant: 'Netflix', date: daysAgo(7), createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { id: id(), userId, category: 'entertainment', amount: 499, description: 'Spotify Premium', merchant: 'Spotify', date: daysAgo(7), createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { id: id(), userId, category: 'medical', amount: 1500, description: 'Medicine - Apollo', merchant: 'Apollo Pharmacy', date: daysAgo(9), createdAt: daysAgo(9), updatedAt: daysAgo(9) },
  { id: id(), userId, category: 'education', amount: 5000, description: 'Udemy Courses', merchant: 'Udemy', date: daysAgo(11), createdAt: daysAgo(11), updatedAt: daysAgo(11) },
  { id: id(), userId, category: 'travel', amount: 12000, description: 'Weekend Trip - Goa', date: daysAgo(14), createdAt: daysAgo(14), updatedAt: daysAgo(14) },
  { id: id(), userId, category: 'investments', amount: 25000, description: 'SIP - Axis Bluechip', date: daysAgo(15), createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { id: id(), userId, category: 'food', amount: 3500, description: 'Restaurant - Dinner', date: daysAgo(16), createdAt: daysAgo(16), updatedAt: daysAgo(16) },
  { id: id(), userId, category: 'bills', amount: 1499, description: 'Internet Bill - Airtel', merchant: 'Airtel', date: daysAgo(18), createdAt: daysAgo(18), updatedAt: daysAgo(18) },
  { id: id(), userId, category: 'bills', amount: 799, description: 'Mobile Recharge', date: daysAgo(20), createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { id: id(), userId, category: 'groceries', amount: 3800, description: 'Weekly Groceries', date: daysAgo(22), createdAt: daysAgo(22), updatedAt: daysAgo(22) },
  { id: id(), userId, category: 'utilities', amount: 2500, description: 'Water & Gas', date: daysAgo(25), createdAt: daysAgo(25), updatedAt: daysAgo(25) },
  { id: id(), userId, category: 'shopping', amount: 15000, description: 'Myntra - Clothing', merchant: 'Myntra', date: daysAgo(28), createdAt: daysAgo(28), updatedAt: daysAgo(28) },
];

// ============ BANK ACCOUNTS ============
export const demoBankAccounts: BankAccount[] = [
  { id: id(), userId, name: 'HDFC Savings', type: 'bank', balance: 285000, bankName: 'HDFC Bank', accountNumber: '****4521', color: '#3B82F6', icon: 'Building2', createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'SBI Salary', type: 'bank', balance: 142000, bankName: 'SBI', accountNumber: '****8734', color: '#22C55E', icon: 'Building2', createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'ICICI FD', type: 'savings', balance: 500000, bankName: 'ICICI Bank', accountNumber: '****2156', color: '#F59E0B', icon: 'PiggyBank', createdAt: monthsAgo(6), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Paytm Wallet', type: 'wallet', balance: 4500, color: '#06B6D4', icon: 'Wallet', createdAt: monthsAgo(3), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Cash in Hand', type: 'wallet', balance: 12000, color: '#8B5CF6', icon: 'Wallet', createdAt: monthsAgo(1), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Home Locker', type: 'locker', balance: 50000, color: '#EC4899', icon: 'Lock', createdAt: monthsAgo(12), updatedAt: daysAgo(30) },
];

// ============ LENDING ============
export const demoLendings: Lending[] = [
  {
    id: id(), userId, borrowerName: 'Rahul Sharma', amount: 50000, remainingBalance: 30000,
    dueDate: daysAgo(-30), payments: [
      { id: id(), amount: 10000, date: daysAgo(45) },
      { id: id(), amount: 10000, date: daysAgo(15) },
    ],
    notes: 'For his sister\'s wedding', status: 'partial',
    createdAt: daysAgo(60), updatedAt: daysAgo(15),
  },
  {
    id: id(), userId, borrowerName: 'Priya Patel', amount: 25000, remainingBalance: 25000,
    dueDate: daysAgo(-15), payments: [],
    notes: 'Emergency medical expense', status: 'pending',
    createdAt: daysAgo(30), updatedAt: daysAgo(30),
  },
  {
    id: id(), userId, borrowerName: 'Amit Kumar', amount: 15000, remainingBalance: 0,
    payments: [
      { id: id(), amount: 15000, date: daysAgo(10) },
    ],
    notes: 'Laptop repair', status: 'completed',
    createdAt: daysAgo(45), updatedAt: daysAgo(10),
  },
];

// ============ BORROWING ============
export const demoBorrowings: Borrowing[] = [
  {
    id: id(), userId, lenderName: 'Dad', amount: 200000, remainingBalance: 100000,
    dueDate: daysAgo(-90), repayments: [
      { id: id(), amount: 50000, date: daysAgo(60) },
      { id: id(), amount: 50000, date: daysAgo(30) },
    ],
    notes: 'For bike purchase', status: 'partial',
    createdAt: daysAgo(120), updatedAt: daysAgo(30),
  },
  {
    id: id(), userId, lenderName: 'Vikram (Friend)', amount: 10000, remainingBalance: 10000,
    dueDate: daysAgo(-7), repayments: [],
    notes: 'Dinner + party expenses', status: 'pending',
    createdAt: daysAgo(14), updatedAt: daysAgo(14),
  },
];

// ============ INVESTMENTS ============
export const demoInvestments: Investment[] = [
  { id: id(), userId, name: 'Infosys', type: 'stocks', investedAmount: 150000, currentValue: 198000, units: 100, buyPrice: 1500, buyDate: monthsAgo(18), createdAt: monthsAgo(18), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Reliance Industries', type: 'stocks', investedAmount: 200000, currentValue: 245000, units: 80, buyPrice: 2500, buyDate: monthsAgo(12), createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'TCS', type: 'stocks', investedAmount: 120000, currentValue: 108000, units: 30, buyPrice: 4000, buyDate: monthsAgo(6), createdAt: monthsAgo(6), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Axis Bluechip Fund', type: 'mutual_funds', investedAmount: 300000, currentValue: 378000, units: 6500, buyPrice: 46.15, buyDate: monthsAgo(24), createdAt: monthsAgo(24), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Mirae Asset Large Cap', type: 'mutual_funds', investedAmount: 200000, currentValue: 248000, units: 2800, buyPrice: 71.43, buyDate: monthsAgo(18), createdAt: monthsAgo(18), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Nifty BeES', type: 'etfs', investedAmount: 100000, currentValue: 118000, units: 400, buyPrice: 250, buyDate: monthsAgo(12), createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Digital Gold', type: 'gold', investedAmount: 80000, currentValue: 96000, units: 12, buyPrice: 6667, buyDate: monthsAgo(8), createdAt: monthsAgo(8), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Bitcoin', type: 'crypto', investedAmount: 50000, currentValue: 72000, units: 0.008, buyPrice: 6250000, buyDate: monthsAgo(6), createdAt: monthsAgo(6), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Ethereum', type: 'crypto', investedAmount: 30000, currentValue: 38000, units: 0.12, buyPrice: 250000, buyDate: monthsAgo(4), createdAt: monthsAgo(4), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'HDFC FD - 1 Year', type: 'fixed_deposit', investedAmount: 500000, currentValue: 535000, buyDate: monthsAgo(10), notes: '7% p.a.', createdAt: monthsAgo(10), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'RBI Savings Bond', type: 'bonds', investedAmount: 100000, currentValue: 107000, buyDate: monthsAgo(12), notes: '7.75% p.a.', createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
];

// ============ GOALS ============
export const demoGoals: Goal[] = [
  { id: id(), userId, name: 'Buy Apartment', category: 'house', targetAmount: 5000000, currentAmount: 1200000, deadline: daysAgo(-730), icon: 'Home', color: '#3B82F6', notes: '2BHK in Bangalore', createdAt: monthsAgo(24), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Emergency Fund', category: 'emergency_fund', targetAmount: 600000, currentAmount: 450000, icon: 'Shield', color: '#EF4444', notes: '6 months expenses', createdAt: monthsAgo(18), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'New Car', category: 'car', targetAmount: 1200000, currentAmount: 380000, deadline: daysAgo(-365), icon: 'Car', color: '#8B5CF6', createdAt: monthsAgo(12), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Europe Trip', category: 'travel', targetAmount: 400000, currentAmount: 120000, deadline: daysAgo(-180), icon: 'Plane', color: '#06B6D4', createdAt: monthsAgo(6), updatedAt: daysAgo(1) },
  { id: id(), userId, name: 'Retirement Corpus', category: 'retirement', targetAmount: 50000000, currentAmount: 2500000, deadline: daysAgo(-10950), icon: 'Sunset', color: '#F97316', notes: 'Target: ₹5Cr by 55', createdAt: monthsAgo(36), updatedAt: daysAgo(1) },
];

// ============ NOTES ============
export const demoNotes: Note[] = [
  { id: id(), userId, title: 'Tax Saving Ideas FY 2025-26', content: '• Max out 80C: EPF + ELSS = ₹1.5L\n• NPS 80CCD(1B): ₹50K extra\n• Health Insurance 80D: ₹25K\n• HRA exemption: Calculate\n• Home Loan Interest 24(b): ₹2L', category: 'tax_notes', color: '#1E3A5F', pinned: true, createdAt: daysAgo(10), updatedAt: daysAgo(2) },
  { id: id(), userId, title: 'Monthly Budget Rule', content: '50-30-20 Rule:\n• 50% Needs (₹62,500)\n• 30% Wants (₹37,500)\n• 20% Savings (₹25,000)\n\nCurrent: 45-25-30 ✅', category: 'financial_journal', color: '#1E3B2F', pinned: true, createdAt: daysAgo(30), updatedAt: daysAgo(5) },
  { id: id(), userId, title: 'Stocks to Research', content: '1. HDFC Bank - Strong fundamentals\n2. Asian Paints - Market leader\n3. Bajaj Finance - High growth\n4. ITC - Dividend play\n5. Tata Motors - EV story', category: 'investment_ideas', color: '#111827', pinned: false, createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { id: id(), userId, title: 'Insurance Review', content: 'Term Insurance: ₹1Cr (LIC)\nHealth: ₹10L (Star Health)\n\nTODO:\n• Compare super top-up plans\n• Consider critical illness rider\n• Review nominee details', category: 'reminders', color: '#3B2F1E', pinned: false, createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { id: id(), userId, title: 'SIP Portfolio Review', content: 'Current SIPs:\n1. Axis Bluechip: ₹10K/mo\n2. Mirae Large Cap: ₹8K/mo\n3. Parag Parikh Flexi: ₹5K/mo\n4. SBI Small Cap: ₹2K/mo\n\nTotal: ₹25K/mo\nTarget: Increase to ₹30K by Dec', category: 'investment_ideas', color: '#1E3B2F', pinned: true, createdAt: daysAgo(14), updatedAt: daysAgo(3) },
  { id: id(), userId, title: 'Emergency Fund Progress', content: 'Target: ₹6L (6 months expenses)\nCurrent: ₹4.5L\nRemaining: ₹1.5L\n\nPlan: Save ₹25K/month\nExpected completion: 6 months', category: 'financial_journal', color: '#3B1E2F', pinned: false, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
];

// ============ NET WORTH HISTORY ============
export const demoNetWorthHistory: { month: string; value: number }[] = [
  { month: '2025-07', value: 2800000 },
  { month: '2025-08', value: 2950000 },
  { month: '2025-09', value: 3050000 },
  { month: '2025-10', value: 3200000 },
  { month: '2025-11', value: 3100000 },
  { month: '2025-12', value: 3350000 },
  { month: '2026-01', value: 3500000 },
  { month: '2026-02', value: 3650000 },
  { month: '2026-03', value: 3580000 },
  { month: '2026-04', value: 3750000 },
  { month: '2026-05', value: 3900000 },
  { month: '2026-06', value: 4100000 },
];

// ============ CASH FLOW HISTORY ============
export const demoCashFlowHistory: { month: string; income: number; expenses: number }[] = [
  { month: 'Jan', income: 168000, expenses: 95000 },
  { month: 'Feb', income: 155000, expenses: 88000 },
  { month: 'Mar', income: 180000, expenses: 102000 },
  { month: 'Apr', income: 162000, expenses: 78000 },
  { month: 'May', income: 195000, expenses: 110000 },
  { month: 'Jun', income: 199500, expenses: 97000 },
];

// ============ EXPENSE BREAKDOWN ============
export const demoExpenseBreakdown = [
  { category: 'Rent', amount: 25000, color: '#06B6D4' },
  { category: 'Investments', amount: 25000, color: '#22C55E' },
  { category: 'Shopping', amount: 23500, color: '#EC4899' },
  { category: 'Food', amount: 14300, color: '#F97316' },
  { category: 'Travel', amount: 12000, color: '#8B5CF6' },
  { category: 'Bills', amount: 5498, color: '#EAB308' },
  { category: 'Education', amount: 5000, color: '#3B82F6' },
  { category: 'Groceries', amount: 3800, color: '#84CC16' },
  { category: 'Utilities', amount: 2500, color: '#F59E0B' },
  { category: 'Transport', amount: 2100, color: '#14B8A6' },
  { category: 'Medical', amount: 1500, color: '#EF4444' },
  { category: 'Entertainment', amount: 1498, color: '#A855F7' },
];

// ============ HEALTH SCORE ============
export const demoHealthScore: HealthScore = {
  id: 'health-1',
  userId,
  score: 78,
  factors: {
    savingsRate: { score: 85, value: 30 },
    debtRatio: { score: 72, value: 15 },
    emergencyFund: { score: 75, months: 4.5 },
    investmentDiversity: { score: 82, value: 7 },
    spendingBehavior: { score: 76, value: 65 },
  },
  recommendations: [
    'Increase emergency fund to cover 6 months of expenses',
    'Consider reducing discretionary spending by 10%',
    'Your SIP allocation is good, consider increasing by ₹5K/month',
    'Review and optimize your insurance coverage',
    'Set up auto-debit for SIPs to ensure consistency',
  ],
  date: daysAgo(0),
  createdAt: daysAgo(0),
};

// ============ DASHBOARD DATA ============
export const demoDashboardData: DashboardData = {
  netWorth: 4100000,
  totalAssets: 4210000,
  totalLiabilities: 110000,
  monthlyIncome: 199500,
  monthlyExpenses: 121696,
  savingsRate: 39,
  investmentPerformance: 18.5,
  cashFlow: 77804,
  healthScore: 78,
  recentTransactions: [],
  netWorthHistory: demoNetWorthHistory,
  cashFlowHistory: demoCashFlowHistory,
  expenseBreakdown: demoExpenseBreakdown,
};
