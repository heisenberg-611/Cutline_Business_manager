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
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  defaultTrialDays: number;
  defaultPlanId: string;
  supportEmail: string;
  replyToEmail: string;
  termsUrl: string;
  privacyUrl: string;
  freeTierProjectLimit: number;
  proTierProjectLimit: number;
  maxFailedLogins: number;
  sessionTimeoutMinutes: number;
}) {
  await requireAdmin(); // SECURITY CHECK
  
  await prisma.globalSettings.upsert({
    where: { id: 'default' },
    update: { ...data },
    create: {
      id: 'default',
      ...data
    }
  });
  
  revalidatePath('/hq/settings');
  revalidatePath('/dashboard/settings/billing/checkout');
  
  return { success: true };
}
