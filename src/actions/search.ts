'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function getSessionUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'account' | 'income' | 'expense' | 'lending' | 'borrowing' | 'investment' | 'goal' | 'subscription';
  link: string;
  amount?: number;
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  try {
    if (!query || query.trim().length < 2) return [];
    const userId = await getSessionUser();
    const cleanQuery = query.trim();

    const [accounts, incomes, expenses, lendings, borrowings, investments, goals, subscriptions] = await Promise.all([
      prisma.bankAccount.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { bankName: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.income.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: cleanQuery, mode: 'insensitive' } },
            { source: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.expense.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: cleanQuery, mode: 'insensitive' } },
            { category: { contains: cleanQuery, mode: 'insensitive' } },
            { merchant: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.lending.findMany({
        where: {
          userId,
          OR: [
            { borrowerName: { contains: cleanQuery, mode: 'insensitive' } },
            { notes: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.borrowing.findMany({
        where: {
          userId,
          OR: [
            { lenderName: { contains: cleanQuery, mode: 'insensitive' } },
            { notes: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.investment.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { type: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.goal.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { category: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.subscription.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { notes: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    const results: SearchResultItem[] = [];

    // Map accounts
    accounts.forEach(a => {
      results.push({
        id: a.id,
        title: a.name,
        subtitle: `${a.type.toUpperCase()} Account - ${a.bankName || ''}`,
        category: 'account',
        link: '/dashboard/accounts',
        amount: a.balance,
      });
    });

    // Map incomes
    incomes.forEach(i => {
      results.push({
        id: i.id,
        title: i.description || i.source,
        subtitle: `Income - ${i.source}`,
        category: 'income',
        link: '/dashboard/income',
        amount: i.amount,
      });
    });

    // Map expenses
    expenses.forEach(e => {
      results.push({
        id: e.id,
        title: e.description || e.category,
        subtitle: `Expense - ${e.category}${e.merchant ? ` (${e.merchant})` : ''}`,
        category: 'expense',
        link: '/dashboard/expenses',
        amount: -e.amount,
      });
    });

    // Map lendings
    lendings.forEach(l => {
      results.push({
        id: l.id,
        title: `Lent to ${l.borrowerName}`,
        subtitle: `Lending - Status: ${l.status}`,
        category: 'lending',
        link: '/dashboard/lending',
        amount: l.amount,
      });
    });

    // Map borrowings
    borrowings.forEach(b => {
      results.push({
        id: b.id,
        title: `Borrowed from ${b.lenderName}`,
        subtitle: `Borrowing - Status: ${b.status}`,
        category: 'borrowing',
        link: '/dashboard/borrowing',
        amount: -b.amount,
      });
    });

    // Map investments
    investments.forEach(inv => {
      results.push({
        id: inv.id,
        title: inv.name,
        subtitle: `Investment - ${inv.type.toUpperCase()}`,
        category: 'investment',
        link: '/dashboard/investments',
        amount: inv.currentValue,
      });
    });

    // Map goals
    goals.forEach(g => {
      results.push({
        id: g.id,
        title: g.name,
        subtitle: `Goal - Target: ${g.category.toUpperCase()}`,
        category: 'goal',
        link: '/dashboard/goals',
        amount: g.currentAmount,
      });
    });

    // Map subscriptions
    subscriptions.forEach(s => {
      results.push({
        id: s.id,
        title: s.name,
        subtitle: `Subscription - ${s.frequency.toUpperCase()} (${s.category})`,
        category: 'subscription',
        link: '/dashboard/subscriptions',
        amount: -s.amount,
      });
    });

    return results;
  } catch (error) {
    console.error('Global search error:', error);
    return [];
  }
}
