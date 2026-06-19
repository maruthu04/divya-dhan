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

// Calculate the next due date based on start date and frequency
function calculateNextDueDate(startDate: Date, frequency: string): Date {
  const next = new Date(startDate);
  next.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If the calculated next due date is strictly in the past, increment it until it's today or in the future
  while (next < today) {
    if (frequency === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (frequency === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      // default: monthly
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}

export async function getSubscriptions() {
  try {
    const userId = await getSessionUser();
    return await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
}

export async function addSubscription(data: {
  name: string;
  amount: number;
  category: string;
  frequency: string;
  startDate: string;
  notes?: string;
}) {
  try {
    const userId = await getSessionUser();
    const amount = Number(data.amount);
    const startDate = new Date(data.startDate);
    const nextDueDate = calculateNextDueDate(startDate, data.frequency);

    const result = await prisma.subscription.create({
      data: {
        userId,
        name: data.name.trim(),
        amount,
        category: data.category,
        frequency: data.frequency,
        startDate,
        nextDueDate,
        notes: data.notes || '',
        active: true,
      },
    });

    revalidatePath('/dashboard/subscriptions');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding subscription:', error);
    return { error: error.message || 'Failed to add subscription' };
  }
}

export async function updateSubscription(
  id: string,
  data: {
    name: string;
    amount: number;
    category: string;
    frequency: string;
    startDate: string;
    notes?: string;
    active?: boolean;
  }
) {
  try {
    const userId = await getSessionUser();
    const amount = Number(data.amount);
    const startDate = new Date(data.startDate);
    const nextDueDate = calculateNextDueDate(startDate, data.frequency);

    const result = await prisma.subscription.update({
      where: { id, userId },
      data: {
        name: data.name.trim(),
        amount,
        category: data.category,
        frequency: data.frequency,
        startDate,
        nextDueDate,
        notes: data.notes || '',
        active: data.active !== undefined ? data.active : true,
      },
    });

    revalidatePath('/dashboard/subscriptions');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return { error: error.message || 'Failed to update subscription' };
  }
}

export async function toggleSubscriptionActive(id: string, active: boolean) {
  try {
    const userId = await getSessionUser();
    const sub = await prisma.subscription.findUnique({
      where: { id, userId },
    });

    if (!sub) {
      return { error: 'Subscription not found' };
    }

    // Re-evaluate next due date if activating
    let nextDueDate = sub.nextDueDate;
    if (active) {
      nextDueDate = calculateNextDueDate(sub.startDate, sub.frequency);
    }

    const result = await prisma.subscription.update({
      where: { id, userId },
      data: {
        active,
        nextDueDate,
      },
    });

    revalidatePath('/dashboard/subscriptions');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error toggling subscription active status:', error);
    return { error: error.message || 'Failed to toggle status' };
  }
}

export async function deleteSubscription(id: string) {
  try {
    const userId = await getSessionUser();
    await prisma.subscription.delete({
      where: { id, userId },
    });

    revalidatePath('/dashboard/subscriptions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    return { error: error.message || 'Failed to delete subscription' };
  }
}
