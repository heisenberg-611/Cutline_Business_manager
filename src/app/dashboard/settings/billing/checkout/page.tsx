import { getPublicPaymentSettings } from '@/lib/subscription';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout | Cutline',
};

export default async function CheckoutPage() {
  const paymentSettings = await getPublicPaymentSettings();
  
  return (
    <CheckoutClient paymentSettings={paymentSettings} />
  );
}
