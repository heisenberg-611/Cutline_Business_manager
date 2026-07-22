import prisma from '@/modules/core/db/prisma';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout | Cutline',
};

export default async function CheckoutPage() {
  const settings = await prisma.globalSettings.findUnique({
    where: { id: 'default' }
  });
  
  let paymentMethods = [];
  try {
    if (settings?.paymentMethods && Array.isArray(settings.paymentMethods)) {
      paymentMethods = settings.paymentMethods;
    }
  } catch (e) {
    // ignore
  }
  
  return (
    <CheckoutClient paymentMethods={paymentMethods} />
  );
}
