'use server';

import prisma from '@/modules/core/db/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../actions';
import { SubscriptionPlan } from '@prisma/client';

export async function forceUpdateSubscription(businessId: string, plan: SubscriptionPlan, periodEnd: Date | null) {
  await requireAdmin();

  await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionPlan: plan,
      subscriptionPeriodEnd: periodEnd,
    }
  });

  revalidatePath('/admin/organizations');
  revalidatePath('/dashboard/settings/billing'); // In case the user is looking at their own dashboard
}

export async function revokeSubscription(businessId: string) {
  await requireAdmin();

  await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionPlan: 'FREE',
      subscriptionPeriodEnd: null,
    }
  });

  revalidatePath('/admin/organizations');
  revalidatePath('/dashboard/settings/billing');
}
