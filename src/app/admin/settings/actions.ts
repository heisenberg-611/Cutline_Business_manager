'use server';

import prisma from '@/modules/core/db/prisma';
import { requireAdmin } from '../actions';
import { revalidatePath } from 'next/cache';

export async function getGlobalSettings() {
  const settings = await prisma.globalSettings.findUnique({
    where: { id: 'default' }
  });
  
  if (!settings) {
    return await prisma.globalSettings.create({
      data: { id: 'default' }
    });
  }
  
  return settings;
}

export async function updateGlobalSettings(data: {
  paymentMethod: string;
  paymentNumber: string;
  qrCodeUrl: string;
}) {
  await requireAdmin(); // SECURITY CHECK
  
  await prisma.globalSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      ...data
    }
  });
  
  revalidatePath('/admin/settings');
  revalidatePath('/dashboard/settings/billing/checkout');
  
  return { success: true };
}
