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

export async function getIncomes() {
  try {
    const userId = await getSessionUser();
    return await prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return [];
  }
}

export async function addIncome(data: {
  source: string;
  amount: number;
  description: string;
  date: string;
  recurring: boolean;
}) {
  try {
    const userId = await getSessionUser();
    const result = await prisma.income.create({
      data: {
        userId,
        source: data.source,
        amount: Number(data.amount),
        description: data.description,
        date: new Date(data.date),
        recurring: data.recurring,
      },
    });

    // Automatically update the BankAccount balance if it exists
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { increment: Number(data.amount) } },
      });
    }

    revalidatePath('/dashboard/income');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding income:', error);
    return { error: error.message || 'Failed to add income' };
  }
}

export async function deleteIncome(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.income.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this record' };
    }

    await prisma.income.delete({ where: { id } });

    // Revert account balance
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { decrement: record.amount } },
      });
    }

    revalidatePath('/dashboard/income');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting income:', error);
    return { error: error.message || 'Failed to delete income' };
  }
}
