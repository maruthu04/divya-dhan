// ============================================
// DivyaDhan — Type Definitions
// ============================================

// ---- Income ----
export type IncomeSource = 
  | 'salary' | 'freelance' | 'business' | 'trading' 
  | 'rental' | 'interest' | 'dividend' | 'other';

export interface Income {
  id: string;
  userId: string;
  source: IncomeSource;
  amount: number;
  description: string;
  date: string;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Expenses ----
export type ExpenseCategory = 
  | 'food' | 'shopping' | 'travel' | 'bills' | 'medical' 
  | 'education' | 'entertainment' | 'investments' | 'rent'
  | 'groceries' | 'transport' | 'utilities' | 'others';

export interface Expense {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  merchant?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Bank Accounts ----
export type AccountType = 'bank' | 'wallet' | 'savings' | 'locker';

export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  bankName?: string;
  accountNumber?: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Lending ----
export interface LendingPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Lending {
  id: string;
  userId: string;
  borrowerName: string;
  amount: number;
  remainingBalance: number;
  dueDate?: string;
  payments: LendingPayment[];
  notes?: string;
  status: 'pending' | 'partial' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ---- Borrowing ----
export interface BorrowingRepayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Borrowing {
  id: string;
  userId: string;
  lenderName: string;
  amount: number;
  remainingBalance: number;
  dueDate?: string;
  repayments: BorrowingRepayment[];
  notes?: string;
  status: 'pending' | 'partial' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ---- Investments ----
export type InvestmentType = 
  | 'stocks' | 'mutual_funds' | 'etfs' | 'gold' 
  | 'crypto' | 'fixed_deposit' | 'bonds' | 'real_estate' | 'other';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  units?: number;
  buyPrice?: number;
  buyDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Goals ----
export type GoalCategory = 
  | 'house' | 'car' | 'emergency_fund' | 'retirement' 
  | 'education' | 'travel' | 'wedding' | 'business' | 'custom';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Notes ----
export type NoteCategory = 
  | 'financial_journal' | 'tax_notes' | 'investment_ideas' 
  | 'general' | 'reminders' | 'research';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Net Worth ----
export interface NetWorthSnapshot {
  id: string;
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    bank: number;
    cash: number;
    investments: number;
    gold: number;
    property: number;
    lentMoney: number;
    loans: number;
    creditCards: number;
    borrowings: number;
  };
  date: string;
  createdAt: string;
}

// ---- Financial Health ----
export interface HealthScore {
  id: string;
  userId: string;
  score: number;
  factors: {
    savingsRate: { score: number; value: number };
    debtRatio: { score: number; value: number };
    emergencyFund: { score: number; months: number };
    investmentDiversity: { score: number; value: number };
    spendingBehavior: { score: number; value: number };
  };
  recommendations: string[];
  date: string;
  createdAt: string;
}

// ---- Reports ----
export interface MonthlyReport {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  investmentGrowth: number;
  topExpenseCategories: { category: string; amount: number }[];
  incomeBySource: { source: string; amount: number }[];
  recommendations: string[];
  summary: string;
  createdAt: string;
}

// ---- AI Chat ----
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ---- Projections ----
export interface ProjectionParams {
  monthlySIP: number;
  monthlyExpenses: number;
  monthlySavings: number;
  currentInvestments: number;
  expectedReturn: number; // annual % 
  inflationRate: number;  // annual %
  years: number;
}

export interface ProjectionResult {
  year: number;
  investmentValue: number;
  totalInvested: number;
  totalReturns: number;
  inflationAdjustedValue: number;
}

// ---- Statement Analyzer ----
export interface AnalyzedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: ExpenseCategory;
  isSubscription: boolean;
  isUnusual: boolean;
}

export interface StatementAnalysis {
  transactions: AnalyzedTransaction[];
  totalCredits: number;
  totalDebits: number;
  subscriptions: { name: string; amount: number; frequency: string }[];
  unusualSpending: { description: string; amount: number; reason: string }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  monthlySummary: string;
}

// ---- Dashboard ----
export interface DashboardData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  investmentPerformance: number;
  cashFlow: number;
  healthScore: number;
  recentTransactions: (Income | Expense)[];
  netWorthHistory: { month: string; value: number }[];
  cashFlowHistory: { month: string; income: number; expenses: number }[];
  expenseBreakdown: { category: string; amount: number; color: string }[];
}

// ---- Navigation ----
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
