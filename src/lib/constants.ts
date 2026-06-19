import type { ExpenseCategory, IncomeSource, InvestmentType, GoalCategory, NoteCategory, AccountType } from '@/types';

// ---- Expense Categories ----
export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { value: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#F97316' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
  { value: 'travel', label: 'Travel', icon: 'Plane', color: '#8B5CF6' },
  { value: 'bills', label: 'Bills & Utilities', icon: 'Receipt', color: '#EAB308' },
  { value: 'medical', label: 'Medical', icon: 'Heart', color: '#EF4444' },
  { value: 'education', label: 'Education', icon: 'GraduationCap', color: '#3B82F6' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#A855F7' },
  { value: 'investments', label: 'Investments', icon: 'TrendingUp', color: '#22C55E' },
  { value: 'rent', label: 'Rent', icon: 'Home', color: '#06B6D4' },
  { value: 'groceries', label: 'Groceries', icon: 'ShoppingCart', color: '#84CC16' },
  { value: 'transport', label: 'Transport', icon: 'Car', color: '#14B8A6' },
  { value: 'utilities', label: 'Utilities', icon: 'Zap', color: '#F59E0B' },
  { value: 'others', label: 'Others', icon: 'MoreHorizontal', color: '#64748B' },
];

// ---- Income Sources ----
export const INCOME_SOURCES: { value: IncomeSource; label: string; icon: string; color: string }[] = [
  { value: 'salary', label: 'Salary', icon: 'Briefcase', color: '#22C55E' },
  { value: 'freelance', label: 'Freelance', icon: 'Laptop', color: '#3B82F6' },
  { value: 'business', label: 'Business', icon: 'Building2', color: '#8B5CF6' },
  { value: 'trading', label: 'Trading', icon: 'BarChart3', color: '#F97316' },
  { value: 'rental', label: 'Rental', icon: 'Home', color: '#06B6D4' },
  { value: 'interest', label: 'Interest', icon: 'Percent', color: '#EAB308' },
  { value: 'dividend', label: 'Dividend', icon: 'Coins', color: '#14B8A6' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#64748B' },
];

// ---- Investment Types ----
export const INVESTMENT_TYPES: { value: InvestmentType; label: string; icon: string; color: string }[] = [
  { value: 'stocks', label: 'Stocks', icon: 'TrendingUp', color: '#22C55E' },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: 'PieChart', color: '#3B82F6' },
  { value: 'etfs', label: 'ETFs', icon: 'BarChart3', color: '#8B5CF6' },
  { value: 'gold', label: 'Gold', icon: 'Gem', color: '#EAB308' },
  { value: 'crypto', label: 'Crypto', icon: 'Bitcoin', color: '#F97316' },
  { value: 'fixed_deposit', label: 'Fixed Deposits', icon: 'Lock', color: '#06B6D4' },
  { value: 'bonds', label: 'Bonds', icon: 'FileText', color: '#14B8A6' },
  { value: 'real_estate', label: 'Real Estate', icon: 'Building', color: '#EC4899' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#64748B' },
];

// ---- Goal Categories ----
export const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: 'house', label: 'Buy House', icon: 'Home', color: '#3B82F6' },
  { value: 'car', label: 'Buy Car', icon: 'Car', color: '#8B5CF6' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: 'Shield', color: '#EF4444' },
  { value: 'retirement', label: 'Retirement', icon: 'Sunset', color: '#F97316' },
  { value: 'education', label: 'Education', icon: 'GraduationCap', color: '#22C55E' },
  { value: 'travel', label: 'Travel', icon: 'Plane', color: '#06B6D4' },
  { value: 'wedding', label: 'Wedding', icon: 'Heart', color: '#EC4899' },
  { value: 'business', label: 'Start Business', icon: 'Building2', color: '#EAB308' },
  { value: 'custom', label: 'Custom Goal', icon: 'Target', color: '#14B8A6' },
];

// ---- Note Categories ----
export const NOTE_CATEGORIES: { value: NoteCategory; label: string; color: string }[] = [
  { value: 'financial_journal', label: 'Financial Journal', color: '#3B82F6' },
  { value: 'tax_notes', label: 'Tax Notes', color: '#EF4444' },
  { value: 'investment_ideas', label: 'Investment Ideas', color: '#22C55E' },
  { value: 'general', label: 'General', color: '#64748B' },
  { value: 'reminders', label: 'Reminders', color: '#F59E0B' },
  { value: 'research', label: 'Research', color: '#8B5CF6' },
];

// ---- Note Colors ----
export const NOTE_COLORS = [
  '#DCFCE7', '#E0F2FE', '#F3E8FF', '#FEF3C7', '#FCE7F3', '#CCFBF1', '#F1F5F9',
];

// ---- Account Types ----
export const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'bank', label: 'Bank Account', icon: 'Building2' },
  { value: 'wallet', label: 'Wallet Cash', icon: 'Wallet' },
  { value: 'savings', label: 'Savings', icon: 'PiggyBank' },
  { value: 'locker', label: 'Locker Cash', icon: 'Lock' },
];

// ---- Chart Colors ----
export const CHART_COLORS = [
  '#00C896', '#38BDF8', '#8B5CF6', '#F97316', '#EC4899',
  '#EAB308', '#22C55E', '#06B6D4', '#EF4444', '#14B8A6',
  '#A855F7', '#3B82F6', '#84CC16',
];

// ---- Months ----
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// ---- App Info ----
export const APP_NAME = 'DivyaDhan';
export const APP_DESCRIPTION = 'Brilliant Personal Wealth Management';

