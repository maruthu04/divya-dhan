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

// ==== LENDING ACTIONS ====
export async function getLendings() {
  try {
    const userId = await getSessionUser();
    return await prisma.lending.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching lendings:', error);
    return [];
  }
}

export async function addLending(data: {
  borrowerName: string;
  amount: number;
  dueDate?: string;
  notes?: string;
  isExisting?: boolean;
}) {
  try {
    const userId = await getSessionUser();
    const amount = Number(data.amount);
    const isExisting = !!data.isExisting;
    const result = await prisma.lending.create({
      data: {
        userId,
        borrowerName: data.borrowerName,
        amount,
        remainingBalance: amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || '',
        status: 'pending',
        payments: [],
        isExisting,
      },
    });

    // Deduct lent amount from bank balance only if it is NOT an existing/old lending
    if (!isExisting) {
      const primaryAccount = await prisma.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await prisma.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { decrement: amount } },
        });
      }
    }

    revalidatePath('/dashboard/lending');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding lending:', error);
    return { error: error.message || 'Failed to add lending' };
  }
}

export async function addLendingPayment(lendingId: string, payment: {
  amount: number;
  date: string;
  note?: string;
}) {
  try {
    const userId = await getSessionUser();
    const lending = await prisma.lending.findUnique({ where: { id: lendingId } });

    if (!lending || lending.userId !== userId) {
      return { error: 'Lending record not found' };
    }

    const payAmount = Number(payment.amount);
    const newRemaining = Math.max(0, lending.remainingBalance - payAmount);
    const newStatus = newRemaining === 0 ? 'completed' : 'partial';

    const newPaymentObj = {
      id: Math.random().toString(36).substring(2, 9),
      amount: payAmount,
      date: payment.date,
      note: payment.note || '',
      createdAt: new Date().toISOString(),
    };

    await prisma.lending.update({
      where: { id: lendingId },
      data: {
        remainingBalance: newRemaining,
        status: newStatus,
        payments: {
          push: newPaymentObj,
        },
      },
    });

    // Add repayment amount back to bank balance
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { increment: payAmount } },
      });
    }

    revalidatePath('/dashboard/lending');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding payment:', error);
    return { error: error.message || 'Failed to add payment' };
  }
}

export async function deleteLending(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.lending.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this record' };
    }

    await prisma.lending.delete({ where: { id } });

    // Restore bank balance only if it was NOT an existing/old lending
    if (!record.isExisting) {
      const primaryAccount = await prisma.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await prisma.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { increment: record.remainingBalance } },
        });
      }
    }

    revalidatePath('/dashboard/lending');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting lending:', error);
    return { error: error.message || 'Failed to delete record' };
  }
}

// ==== BORROWING ACTIONS ====
export async function getBorrowings() {
  try {
    const userId = await getSessionUser();
    return await prisma.borrowing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export async function addBorrowing(data: {
  lenderName: string;
  amount: number;
  dueDate?: string;
  notes?: string;
}) {
  try {
    const userId = await getSessionUser();
    const amount = Number(data.amount);
    const result = await prisma.borrowing.create({
      data: {
        userId,
        lenderName: data.lenderName,
        amount,
        remainingBalance: amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || '',
        status: 'pending',
        repayments: [],
      },
    });

    // Add borrowed amount to bank balance
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { increment: amount } },
      });
    }

    revalidatePath('/dashboard/borrowing');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding borrowing:', error);
    return { error: error.message || 'Failed to add borrowing' };
  }
}

export async function addBorrowingRepayment(borrowingId: string, repayment: {
  amount: number;
  date: string;
  note?: string;
}) {
  try {
    const userId = await getSessionUser();
    const borrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } });

    if (!borrowing || borrowing.userId !== userId) {
      return { error: 'Borrowing record not found' };
    }

    const payAmount = Number(repayment.amount);
    const newRemaining = Math.max(0, borrowing.remainingBalance - payAmount);
    const newStatus = newRemaining === 0 ? 'completed' : 'partial';

    const newRepaymentObj = {
      id: Math.random().toString(36).substring(2, 9),
      amount: payAmount,
      date: repayment.date,
      note: repayment.note || '',
      createdAt: new Date().toISOString(),
    };

    await prisma.borrowing.update({
      where: { id: borrowingId },
      data: {
        remainingBalance: newRemaining,
        status: newStatus,
        repayments: {
          push: newRepaymentObj,
        },
      },
    });

    // Deduct repayment amount from bank balance
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { decrement: payAmount } },
      });
    }

    revalidatePath('/dashboard/borrowing');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding repayment:', error);
    return { error: error.message || 'Failed to add repayment' };
  }
}

export async function deleteBorrowing(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.borrowing.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this record' };
    }

    await prisma.borrowing.delete({ where: { id } });

    // Revert balance (deduct outstanding borrowed amount)
    const primaryAccount = await prisma.bankAccount.findFirst({
      where: { userId, type: 'bank' },
    });
    if (primaryAccount) {
      await prisma.bankAccount.update({
        where: { id: primaryAccount.id },
        data: { balance: { decrement: record.remainingBalance } },
      });
    }

    revalidatePath('/dashboard/borrowing');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting borrowing:', error);
    return { error: error.message || 'Failed to delete record' };
  }
}
