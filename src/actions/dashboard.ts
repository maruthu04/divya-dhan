'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { processSIPRollovers } from './investments';

export async function getDashboardData() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Process SIP rollovers first
    await processSIPRollovers(userId);

    const [incomes, expenses, accounts, investments, lendings, borrowings, goals, notes, subscriptions] = await Promise.all([
      prisma.income.findMany({
        where: { userId },
        include: { bankAccount: true },
        orderBy: { date: 'desc' },
      }),
      prisma.expense.findMany({
        where: { userId },
        include: { bankAccount: true },
        orderBy: { date: 'desc' },
      }),
      prisma.bankAccount.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      }),
      prisma.investment.findMany({
        where: { userId },
        orderBy: { buyDate: 'desc' },
      }),
      prisma.lending.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.borrowing.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: [
          { pinned: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { nextDueDate: 'asc' },
      }),
    ]);

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, monthlyBudget: true }
    });

    // Calculate current net worth figures
    const bankBalance = accounts.filter((a: any) => a.type === 'bank').reduce((s: number, a: any) => s + a.balance, 0);
    const cashBalance = accounts.filter((a: any) => a.type === 'wallet').reduce((s: number, a: any) => s + a.balance, 0);
    const savingsBalance = accounts.filter((a: any) => a.type === 'savings').reduce((s: number, a: any) => s + a.balance, 0);
    const lockerBalance = accounts.filter((a: any) => a.type === 'locker').reduce((s: number, a: any) => s + a.balance, 0);
    const investmentsValue = investments.reduce((s: number, i: any) => s + i.currentValue, 0);
    const lentMoney = lendings.reduce((s: number, l: any) => s + l.remainingBalance, 0);
    const goalsSaved = goals.reduce((s: number, g: any) => s + g.currentAmount, 0);
    const totalAssets = bankBalance + cashBalance + savingsBalance + lockerBalance + investmentsValue + lentMoney + goalsSaved;

    const totalLiabilities = borrowings.reduce((s: number, b: any) => s + b.remainingBalance, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Upsert the single NetWorth document for this user (only 1 record per user in the collection)
    await prisma.netWorth.upsert({
      where: { userId },
      update: {
        totalAssets,
        totalLiabilities,
        netWorth,
      },
      create: {
        userId,
        totalAssets,
        totalLiabilities,
        netWorth,
      },
    });

    return {
      success: true,
      incomes,
      expenses,
      accounts,
      investments,
      lendings,
      borrowings,
      goals,
      notes,
      subscriptions,
      user: {
        name: dbUser?.name || session?.user?.name || 'User',
        email: session?.user?.email,
        monthlyBudget: dbUser?.monthlyBudget || null,
        id: userId,
      }
    };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return { error: error.message || 'Failed to fetch dashboard data' };
  }
}
