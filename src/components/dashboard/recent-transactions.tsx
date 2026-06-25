'use client';

import { formatCurrency, getRelativeTime } from '@/lib/formatters';
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/lib/constants';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  bankAccount?: {
    name: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '450ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Recent Transactions</h3>
          <p className="text-xs text-text-muted mt-0.5">Latest activity</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const categoryMeta = isIncome
            ? INCOME_SOURCES.find(s => s.value === tx.category)
            : EXPENSE_CATEGORIES.find(c => c.value === tx.category);

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 group hover:bg-surface-hover/50 -mx-2 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${categoryMeta?.color || '#64748B'}15` }}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4" style={{ color: categoryMeta?.color || '#22C55E' }} />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" style={{ color: categoryMeta?.color || '#EF4444' }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-text-muted">{getRelativeTime(tx.date)}</p>
                    {tx.bankAccount && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ 
                            backgroundColor: `${tx.bankAccount.color}15`, 
                            color: tx.bankAccount.color 
                          }}
                        >
                          {tx.bankAccount.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ${isIncome ? 'text-success' : 'text-text'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
