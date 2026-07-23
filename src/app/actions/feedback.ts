'use server';

import prisma from '@/modules/core/db/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function submitPlatformFeedback(data: {
  type: string;
  message: string;
  url: string;
  email?: string;
}) {
  try {
    const user = await currentUser();
    
    // We try to get the user ID and email if logged in, otherwise use provided email
    const userId = user?.id || null;
    const finalEmail = user?.emailAddresses[0]?.emailAddress || data.email || null;

    if (!data.message || data.message.trim() === '') {
      throw new Error('Message is required');
    }

    const feedback = await prisma.platformFeedback.create({
      data: {
        userId,
        email: finalEmail,
        type: data.type,
        message: data.message.trim(),
        url: data.url,
        status: 'NEW',
      },
    });

    return { success: true, id: feedback.id };
  } catch (error: any) {
    console.error('Failed to submit feedback:', error);
    return { success: false, error: error.message || 'Failed to submit feedback' };
  }
}
