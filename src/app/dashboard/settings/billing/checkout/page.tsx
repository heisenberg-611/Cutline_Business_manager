"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PLANS, PLAN_PRICES } from '@/lib/subscription';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') || PLANS.PRO;
  
  const [trxId, setTrxId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate plan
  if (plan !== PLANS.PRO && plan !== PLANS.BUSINESS) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold">Invalid Plan Selected</h2>
        <Link href="/dashboard/settings/billing" className="text-indigo-600 mt-4 block">Return to Billing</Link>
      </div>
    );
  }

  const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/subscription/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, trxId, paymentMethod })
      });

      if (!res.ok) throw new Error('Failed to submit request');
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/settings/billing');
      }, 3000);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Payment Submitted!</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Your transaction ID has been sent to our team for verification. 
          Your account will be upgraded as soon as the payment is confirmed.
        </p>
        <p className="text-sm text-zinc-400 pt-4">Redirecting you back to billing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <Link href="/dashboard/settings/billing" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Plans
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* Left Side: Instructions & QR */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 md:w-1/2 border-r border-zinc-200 dark:border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Upgrade to {plan.charAt(0) + plan.slice(1).toLowerCase()}</h3>
            <p className="text-sm text-zinc-500 mt-2">
              Please complete your payment manually to activate your subscription.
            </p>

            <div className="mt-8 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-white/5 pb-4">
                <span className="text-sm font-medium text-zinc-500">Amount to send</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">৳{price}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-medium text-zinc-500 mb-1">bKash Personal / Nagad</span>
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 select-all">01XXX-XXXXXX</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center">
              <span className="text-xs text-zinc-400">[QR Code Image Placeholder]</span>
              {/* TODO: Admin needs to add their actual QR Code image here */}
            </div>
            <p className="text-xs text-zinc-500 mt-3">Scan to pay with bKash app</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Submit Transaction</h3>
            <p className="text-sm text-zinc-500 mt-1">Enter your details after sending the money.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Payment Method</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-zinc-950"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="BankTransfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Transaction ID</label>
              <input
                type="text"
                required
                placeholder="e.g. 9F8G7H6J5K"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-zinc-950"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !trxId.trim()}
              className="mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Payment'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
