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

export interface DynamicNotification {
  id: string;
  type: 'low_balance' | 'debt_due' | 'goal_progress' | 'large_expense' | 'subscription_renewal';
  urgency: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string; // ISO string for simple serialization
}

export async function getDynamicNotifications(): Promise<DynamicNotification[]> {
  try {
    const userId = await getSessionUser();

    const [accounts, lendings, borrowings, goals, expenses, subscriptions] = await Promise.all([
      prisma.bankAccount.findMany({ where: { userId } }),
      prisma.lending.findMany({ where: { userId, status: { in: ['pending', 'partial'] } } }),
      prisma.borrowing.findMany({ where: { userId, status: { in: ['pending', 'partial'] } } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      }),
      prisma.subscription.findMany({ where: { userId, active: true } }),
    ]);

    const notifications: DynamicNotification[] = [];

    // 1. Low Balance Alerts
    accounts.forEach(a => {
      if (a.balance < 5000) {
        notifications.push({
          id: `low-bal-${a.id}`,
          type: 'low_balance',
          urgency: a.balance < 1000 ? 'critical' : 'warning',
          title: `Low Balance: ${a.name}`,
          description: `Your balance is ₹${a.balance.toLocaleString('en-IN')}. Consider topping up soon.`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 2. Debt Due/Overdue Alerts (within 3 days or past due)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const now = new Date();

    lendings.forEach(l => {
      if (l.dueDate) {
        const due = new Date(l.dueDate);
        if (due <= threeDaysFromNow) {
          const isOverdue = due < now;
          notifications.push({
            id: `debt-lend-${l.id}`,
            type: 'debt_due',
            urgency: isOverdue ? 'critical' : 'warning',
            title: isOverdue ? `Overdue Debt from ${l.borrowerName}` : `Repayment due from ${l.borrowerName}`,
            description: `Amount: ₹${l.remainingBalance.toLocaleString('en-IN')}. Due date: ${due.toLocaleDateString('en-IN')}`,
            timestamp: due.toISOString(),
          });
        }
      }
    });

    borrowings.forEach(b => {
      if (b.dueDate) {
        const due = new Date(b.dueDate);
        if (due <= threeDaysFromNow) {
          const isOverdue = due < now;
          notifications.push({
            id: `debt-borrow-${b.id}`,
            type: 'debt_due',
            urgency: isOverdue ? 'critical' : 'warning',
            title: isOverdue ? `Overdue Repayment to ${b.lenderName}` : `Repayment due to ${b.lenderName}`,
            description: `Amount: ₹${b.remainingBalance.toLocaleString('en-IN')}. Due date: ${due.toLocaleDateString('en-IN')}`,
            timestamp: due.toISOString(),
          });
        }
      }
    });

    // 3. Goal Progress Alerts (100% or 50%)
    goals.forEach(g => {
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) : 0;
      if (progress >= 1.0) {
        notifications.push({
          id: `goal-reach-${g.id}`,
          type: 'goal_progress',
          urgency: 'info',
          title: `Goal Achieved: ${g.name}! 🎉`,
          description: `You've reached your target of ₹${g.targetAmount.toLocaleString('en-IN')}!`,
          timestamp: g.updatedAt.toISOString(),
        });
      } else if (progress >= 0.5) {
        notifications.push({
          id: `goal-half-${g.id}`,
          type: 'goal_progress',
          urgency: 'info',
          title: `Goal Halfway: ${g.name} 🚀`,
          description: `You saved ₹${g.currentAmount.toLocaleString('en-IN')} (50%+ of your target).`,
          timestamp: g.updatedAt.toISOString(),
        });
      }
    });

    // 4. Large Expense Alert (>= 15,000)
    expenses.forEach(e => {
      if (e.amount >= 15000) {
        notifications.push({
          id: `expense-large-${e.id}`,
          type: 'large_expense',
          urgency: 'warning',
          title: `Large Expense Logged`,
          description: `₹${e.amount.toLocaleString('en-IN')} spent on "${e.description || e.category}"`,
          timestamp: e.date.toISOString(),
        });
      }
    });

    // 5. Subscription Renewal Alerts
    subscriptions.forEach(s => {
      if (s.nextDueDate) {
        const due = new Date(s.nextDueDate);
        if (due <= threeDaysFromNow) {
          const isOverdue = due < now;
          notifications.push({
            id: `sub-due-${s.id}`,
            type: 'subscription_renewal',
            urgency: isOverdue ? 'critical' : 'warning',
            title: isOverdue ? `Overdue Renewal: ${s.name}` : `Upcoming Renewal: ${s.name}`,
            description: `Subscription of ₹${s.amount.toLocaleString('en-IN')} is due on ${due.toLocaleDateString('en-IN')}`,
            timestamp: due.toISOString(),
          });
        }
      }
    });

    // Sort by urgency: critical first, then warning, then info. Within that, sort by date descending
    const urgencyWeight = {
      critical: 3,
      warning: 2,
      info: 1,
    };

    return notifications.sort((a, b) => {
      const weightDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  } catch (error) {
    console.error('Failed to get dynamic notifications:', error);
    return [];
  }
}
