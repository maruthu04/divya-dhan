'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function getSessionUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function getExpenses() {
  try {
    const userId = await getSessionUser();
    return await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function addExpense(data: {
  category: string;
  amount: number;
  description: string;
  merchant?: string;
  date: string;
}) {
  try {
    const userId = await getSessionUser();
    const result = await prisma.expense.create({
      data: {
        userId,
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        merchant: data.merchant || '',
        date: new Date(data.date),
      },
    });

    // Automatically update the BankAccount balance (deduct)
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { decrement: Number(data.amount) } },
      });
    }

    revalidatePath('/dashboard/expenses');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding expense:', error);
    return { error: error.message || 'Failed to add expense' };
  }
}

export async function deleteExpense(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.expense.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this record' };
    }

    await prisma.expense.delete({ where: { id } });

    // Revert account balance
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { increment: record.amount } },
      });
    }

    revalidatePath('/dashboard/expenses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return { error: error.message || 'Failed to delete expense' };
  }
}

export async function addExpensesBulk(expenses: {
  category: string;
  amount: number;
  description: string;
  merchant?: string;
  date: string;
}[]) {
  try {
    const userId = await getSessionUser();
    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const createdExpenses = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const exp of expenses) {
        const res = await tx.expense.create({
          data: {
            userId,
            category: exp.category,
            amount: Number(exp.amount),
            description: exp.description,
            merchant: exp.merchant || '',
            date: new Date(exp.date),
          }
        });
        results.push(res);
      }

      const primaryAccount = await tx.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await tx.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { decrement: totalAmount } },
        });
      }

      return results;
    });

    revalidatePath('/dashboard/expenses');
    revalidatePath('/dashboard');
    return { success: true, count: createdExpenses.length };
  } catch (error: any) {
    console.error('Error importing expenses in bulk:', error);
    return { error: error.message || 'Failed to import expenses' };
  }
}
