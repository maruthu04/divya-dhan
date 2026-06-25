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

export async function getInvestments() {
  try {
    const userId = await getSessionUser();
    
    // Process monthly SIP rollovers before returning investments
    await processSIPRollovers(userId);

    return await prisma.investment.findMany({
      where: { userId },
      orderBy: { buyDate: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return [];
  }
}

export async function processSIPRollovers(userId: string) {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find all SIP investments that haven't been processed for the current month
    const sipInvestments = await prisma.investment.findMany({
      where: {
        userId,
        isSIP: true,
        lastDeductedMonth: {
          lt: currentMonthStart,
        },
      },
    });

    if (sipInvestments.length === 0) return;

    let totalDeduction = 0;

    for (const inv of sipInvestments) {
      if (!inv.lastDeductedMonth || !inv.sipAmount || !inv.sipStartDate) continue;

      const lastDecDate = new Date(inv.lastDeductedMonth);
      const monthsElapsed = (now.getFullYear() - lastDecDate.getFullYear()) * 12 + (now.getMonth() - lastDecDate.getMonth());

      if (monthsElapsed > 0) {
        const deductionForThisSIP = inv.sipAmount * monthsElapsed;
        totalDeduction += deductionForThisSIP;

        // Recompute database investedAmount and currentValue up to now
        const startDate = new Date(inv.sipStartDate);
        const totalMonthsElapsed = Math.max(1,
          (now.getFullYear() - startDate.getFullYear()) * 12 +
          (now.getMonth() - startDate.getMonth()) + 1
        );

        const newInvestedAmount = inv.sipAmount * totalMonthsElapsed;
        const r = 0.01;
        let newCurrentValue = inv.sipAmount * (((Math.pow(1 + r, totalMonthsElapsed) - 1) / r) * (1 + r));
        newCurrentValue = Math.round(newCurrentValue * 100) / 100;

        // Update the investment record in the database
        await prisma.investment.update({
          where: { id: inv.id },
          data: {
            investedAmount: newInvestedAmount,
            currentValue: newCurrentValue,
            lastDeductedMonth: currentMonthStart,
          },
        });
      }
    }

    if (totalDeduction > 0) {
      // Deduct the rollover amount from the primary bank balance
      const primaryAccount = await prisma.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await prisma.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { decrement: totalDeduction } },
        });
      }
    }
  } catch (error) {
    console.error('Error processing SIP rollovers:', error);
  }
}

export async function addInvestment(data: {
  name: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  units?: number;
  buyPrice?: number;
  buyDate: string;
  notes?: string;
  isSIP?: boolean;
  sipAmount?: number;
  sipStartDate?: string;
  deductFromBank?: boolean;
}) {
  try {
    const userId = await getSessionUser();

    // For SIP investments, compute initial invested amount and estimated current value
    let investedAmount = Number(data.investedAmount);
    let currentValue = Number(data.currentValue);
    let lastDeductedMonth: Date | null = null;

    if (data.isSIP && data.sipAmount && data.sipStartDate) {
      const sipAmt = Number(data.sipAmount);
      const startDate = new Date(data.sipStartDate);
      const now = new Date();

      // Calculate months elapsed (minimum 1)
      const monthsElapsed = Math.max(1,
        (now.getFullYear() - startDate.getFullYear()) * 12 +
        (now.getMonth() - startDate.getMonth()) + 1
      );

      investedAmount = sipAmt * monthsElapsed;

      // SIP Future Value: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
      // Using 12% annual = 1% monthly
      const r = 0.01;
      currentValue = sipAmt * (((Math.pow(1 + r, monthsElapsed) - 1) / r) * (1 + r));
      currentValue = Math.round(currentValue * 100) / 100;
      
      // Set lastDeductedMonth to the first day of the current month
      lastDeductedMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const result = await prisma.investment.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        investedAmount,
        currentValue,
        units: data.units ? Number(data.units) : null,
        buyPrice: data.buyPrice ? Number(data.buyPrice) : null,
        buyDate: new Date(data.buyDate),
        notes: data.notes || '',
        isSIP: data.isSIP || false,
        sipAmount: data.isSIP && data.sipAmount ? Number(data.sipAmount) : null,
        sipStartDate: data.isSIP && data.sipStartDate ? new Date(data.sipStartDate) : null,
        deductFromBank: data.deductFromBank !== false,
        lastDeductedMonth,
      },
    });

    // Deduct invested amount from Primary Bank balance only if deductFromBank is true
    if (data.deductFromBank !== false && investedAmount > 0) {
      const primaryAccount = await prisma.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await prisma.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { decrement: investedAmount } },
        });
      }
    }

    revalidatePath('/dashboard/investments');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding investment:', error);
    return { error: error.message || 'Failed to add investment' };
  }
}

export async function deleteInvestment(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.investment.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this record' };
    }

    await prisma.investment.delete({ where: { id } });

    // Refund bank account balance only if it was originally deducted from bank
    if (record.deductFromBank !== false && record.investedAmount > 0) {
      const primaryAccount = await prisma.bankAccount.findFirst({
        where: { userId, type: 'bank' },
      });
      if (primaryAccount) {
        await prisma.bankAccount.update({
          where: { id: primaryAccount.id },
          data: { balance: { increment: record.investedAmount } },
        });
      }
    }

    revalidatePath('/dashboard/investments');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting investment:', error);
    return { error: error.message || 'Failed to delete investment' };
  }
}

export async function updateInvestment(
  id: string,
  data: {
    name: string;
    type: string;
    investedAmount: number;
    currentValue: number;
    units?: number;
    buyPrice?: number;
    buyDate: string;
    notes?: string;
    isSIP?: boolean;
    sipAmount?: number;
    sipStartDate?: string;
  }
) {
  try {
    const userId = await getSessionUser();
    const existing = await prisma.investment.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return { error: 'Not authorized to update this record' };
    }

    let investedAmount = Number(data.investedAmount);
    let currentValue = Number(data.currentValue);
    let lastDeductedMonth = existing.lastDeductedMonth;

    if (data.isSIP && data.sipAmount && data.sipStartDate) {
      // If it transitioned from non-SIP to SIP, initialize lastDeductedMonth
      if (!existing.isSIP) {
        const now = new Date();
        lastDeductedMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    } else {
      lastDeductedMonth = null;
    }

    const result = await prisma.investment.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        investedAmount,
        currentValue,
        units: data.units ? Number(data.units) : null,
        buyPrice: data.buyPrice ? Number(data.buyPrice) : null,
        buyDate: new Date(data.buyDate),
        notes: data.notes || '',
        isSIP: data.isSIP || false,
        sipAmount: data.isSIP && data.sipAmount ? Number(data.sipAmount) : null,
        sipStartDate: data.isSIP && data.sipStartDate ? new Date(data.sipStartDate) : null,
        lastDeductedMonth,
      },
    });

    revalidatePath('/dashboard/investments');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error updating investment:', error);
    return { error: error.message || 'Failed to update investment' };
  }
}

