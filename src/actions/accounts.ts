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

export async function getAccounts() {
  try {
    const userId = await getSessionUser();
    return await prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}

export async function addAccount(data: {
  name: string;
  type: string;
  balance: number;
  bankName?: string;
  accountNumber?: string;
  color: string;
  icon: string;
}) {
  try {
    const userId = await getSessionUser();
    const result = await prisma.bankAccount.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        balance: Number(data.balance),
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        color: data.color || '#3B82F6',
        icon: data.icon || 'Building2',
      },
    });

    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding account:', error);
    return { error: error.message || 'Failed to add account' };
  }
}

export async function deleteAccount(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.bankAccount.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this account' };
    }

    await prisma.bankAccount.delete({ where: { id } });

    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return { error: error.message || 'Failed to delete account' };
  }
}
