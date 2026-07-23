'use server';

import prisma from '@/modules/core/db/prisma';
import { requireAdmin } from '../actions';
import { revalidatePath } from 'next/cache';

export async function updateBusinessCustomLimit(businessId: string, customProjectLimit: number | null) {
  try {
    await requireAdmin();
    
    await prisma.business.update({
      where: { id: businessId },
      data: { customProjectLimit }
    });
    
    revalidatePath('/hq/users');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update custom limit:", error);
    return { success: false, error: error.message || 'An unknown error occurred while updating limit' };
  }
}
