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
        createdAt: true,
      },
    });
    return { success: true, data: user };
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

    if (!currentPass || !newPass) {
      return { error: 'Both current and new password are required.' };
    }

    if (newPass.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    // Compare password
    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      return { error: 'Current password is incorrect.' };
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
