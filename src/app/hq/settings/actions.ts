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
      data: { id: 'default', paymentMethods: [] }
    });
  }
  
  return settings;
}

export async function updateGlobalSettings(data: {
  paymentMethods: any[];
}) {
  await requireAdmin(); // SECURITY CHECK
  
  await prisma.globalSettings.upsert({
    where: { id: 'default' },
    update: { paymentMethods: data.paymentMethods },
    create: {
      id: 'default',
      paymentMethods: data.paymentMethods
    }
  });
  
  revalidatePath('/hq/settings');
  revalidatePath('/dashboard/settings/billing/checkout');
  
  return { success: true };
}
