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

export async function getGoals() {
  try {
    const userId = await getSessionUser();
    return await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

export async function addGoal(data: {
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  notes?: string;
}) {
  try {
    const userId = await getSessionUser();
    const result = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        category: data.category,
        targetAmount: Number(data.targetAmount),
        currentAmount: Number(data.currentAmount),
        deadline: data.deadline ? new Date(data.deadline) : null,
        icon: data.icon || 'Target',
        color: data.color || '#00C896',
        notes: data.notes || '',
      },
    });

    revalidatePath('/dashboard/goals');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding goal:', error);
    return { error: error.message || 'Failed to add goal' };
  }
}

export async function updateGoalAmount(id: string, currentAmount: number) {
  try {
    const userId = await getSessionUser();
    const goal = await prisma.goal.findUnique({ where: { id } });

    if (!goal || goal.userId !== userId) {
      return { error: 'Not authorized to update this goal' };
    }

    await prisma.goal.update({
      where: { id },
      data: { currentAmount: Number(currentAmount) },
    });

    revalidatePath('/dashboard/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating goal amount:', error);
    return { error: error.message || 'Failed to update progress' };
  }
}

export async function deleteGoal(id: string) {
  try {
    const userId = await getSessionUser();
    const record = await prisma.goal.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return { error: 'Not authorized to delete this goal' };
    }

    await prisma.goal.delete({ where: { id } });

    revalidatePath('/dashboard/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return { error: error.message || 'Failed to delete goal' };
  }
}

export async function addMoneyToGoals(updates: { id: string; amountToAdd: number }[]) {
  try {
    const userId = await getSessionUser();
    
    for (const update of updates) {
      if (update.amountToAdd <= 0) continue;
      const goal = await prisma.goal.findUnique({ where: { id: update.id } });
      if (!goal || goal.userId !== userId) {
        return { error: `Not authorized to update goal ${update.id}` };
      }
      await prisma.goal.update({
        where: { id: update.id },
        data: { currentAmount: goal.currentAmount + Number(update.amountToAdd) }
      });
    }

    revalidatePath('/dashboard/goals');
    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/net-worth');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding money to goals:', error);
    return { error: error.message || 'Failed to add money to goals' };
  }
}

