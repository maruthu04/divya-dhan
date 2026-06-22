'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function getSessionUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function getUserProfileData() {
  try {
    const userId = await getSessionUser();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        occupation: true,
        monthlyBudget: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const { password, ...safeUser } = user;
    const hasPassword = !!password;

    return { success: true, data: safeUser, hasPassword };
  } catch (error: any) {
    console.error('Get profile data error:', error);
    return { error: error.message || 'Failed to fetch profile data' };
  }
}

export async function updateUserProfile(data: {
  name: string;
  email?: string;
  age?: number;
  occupation?: string;
  monthlyBudget?: number;
}) {
  try {
    const userId = await getSessionUser();

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
        // email is intentionally omitted to keep it un-editable/locked after registration
        age: data.age ? Number(data.age) : null,
        occupation: data.occupation ? data.occupation.trim() : null,
        monthlyBudget: data.monthlyBudget ? Number(data.monthlyBudget) : null,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { error: error.message || 'Failed to update profile' };
  }
}

export async function changeUserPassword(currentPass: string, newPass: string) {
  try {
    const userId = await getSessionUser();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    if (!newPass) {
      return { error: 'New password is required.' };
    }

    if (newPass.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }

    // Compare password if user already has one set (e.g., credentials signup)
    if (user.password) {
      if (!currentPass) {
        return { error: 'Current password is required.' };
      }

      let isMatch = false;
      try {
        if (user.password.startsWith('$2')) {
          isMatch = await bcrypt.compare(currentPass, user.password);
        } else {
          // Support plain text passwords for testing/dev environments
          isMatch = currentPass === user.password;
        }
      } catch (err) {
        // Fallback to direct comparison if bcrypt comparison fails due to format
        isMatch = currentPass === user.password;
      }

      if (!isMatch) {
        return { error: 'Current password is incorrect.' };
      }
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPass, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Change password error:', error);
    return { error: error.message || 'Failed to change password' };
  }
}
