import prisma from '@/modules/core/db/prisma';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout | Cutline',
};

export default async function CheckoutPage() {
  const settings = await prisma.globalSettings.findUnique({
    where: { id: 'default' }
  });
  
  const paymentSettings = {
    paymentMethod: settings?.paymentMethod || 'bKash Personal / Nagad',
    paymentNumber: settings?.paymentNumber || '01XXX-XXXXXX',
    qrCodeUrl: settings?.qrCodeUrl || null
  };
  
  return (
    <CheckoutClient paymentSettings={paymentSettings} />
  );
}
