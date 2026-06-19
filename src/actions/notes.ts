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

export async function getNotes() {
  try {
    const userId = await getSessionUser();
    return await prisma.note.findMany({
      where: { userId },
      orderBy: [
        { pinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

export async function addNote(data: {
  title: string;
  content: string;
  category: string;
  color: string;
  pinned?: boolean;
}) {
  try {
    const userId = await getSessionUser();
    const result = await prisma.note.create({
      data: {
        userId,
        title: data.title || 'Untitled Note',
        content: data.content || '',
        category: data.category || 'general',
        color: data.color || '#111827',
        pinned: !!data.pinned,
      },
    });

    revalidatePath('/dashboard/notes');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error adding note:', error);
    return { error: error.message || 'Failed to add note' };
  }
}

export async function togglePinNote(id: string) {
  try {
    const userId = await getSessionUser();
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      return { error: 'Not authorized' };
    }

    await prisma.note.update({
      where: { id },
      data: { pinned: !note.pinned },
    });

    revalidatePath('/dashboard/notes');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    return { error: error.message || 'Failed to toggle pin' };
  }
}

export async function deleteNote(id: string) {
  try {
    const userId = await getSessionUser();
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      return { error: 'Not authorized' };
    }

    await prisma.note.delete({ where: { id } });

    revalidatePath('/dashboard/notes');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return { error: error.message || 'Failed to delete note' };
  }
}
