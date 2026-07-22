'use server';

import prisma from '@/modules/core/db/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const COOKIE_NAME = 'admin_session';

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.globalAdmin.findUnique({ where: { email } });
  
  if (!admin) {
    throw new Error('Access denied: You are not a global admin.');
  }

  // If passwordHash is null, this is their first time logging in, so we SET it.
  if (!admin.passwordHash) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.globalAdmin.update({
      where: { email },
      data: { passwordHash },
    });
  } else {
    // If passwordHash exists, verify it
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  revalidatePath('/admin');
}

export async function addAdmin(email: string) {
  await prisma.globalAdmin.create({
    data: { email },
  });
  revalidatePath('/admin/admins');
  return { success: true };
}

export async function removeAdmin(email: string) {
  await prisma.globalAdmin.delete({
    where: { email },
  });
  revalidatePath('/admin/admins');
  return { success: true };
}
