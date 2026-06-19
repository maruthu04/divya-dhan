'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
      return { error: 'All fields are required.' };
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return { error: 'Email is already registered.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: trimmedEmail,
        password: hashedPassword,
      },
    });

    // Proactively seed initial bank accounts/categories for a better experience if empty
    await prisma.bankAccount.createMany({
      data: [
        {
          userId: user.id,
          name: 'Primary Bank',
          type: 'bank',
          balance: 0,
          color: '#3B82F6',
          icon: 'Building2',
        },
        {
          userId: user.id,
          name: 'Cash Wallet',
          type: 'wallet',
          balance: 0,
          color: '#8B5CF6',
          icon: 'Wallet',
        }
      ]
    });

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: 'An unexpected error occurred during signup.' };
  }
}

export async function saveOnboardingDetails(userId: string, name: string, age: number, occupation: string, monthlyBudget?: number) {
  try {
    if (!userId || !name || !age || !occupation) {
      return { error: 'Required fields are missing.' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age: Number(age),
        occupation,
        monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Save onboarding details error:', error);
    return { error: 'An unexpected error occurred while saving details.' };
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { name: true },
    });

    return {
      ...session.user,
      name: dbUser?.name || session.user.name,
    };
  } catch (error) {
    console.error('Failed to get current user session:', error);
    return null;
  }
}
