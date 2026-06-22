'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getDashboardData() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const [incomes, expenses, accounts, investments, lendings, borrowings, goals, notes, subscriptions] = await Promise.all([
      prisma.income.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.expense.findMany({
        where: { userId },
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
