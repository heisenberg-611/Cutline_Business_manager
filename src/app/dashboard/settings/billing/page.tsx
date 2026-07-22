import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/modules/core/db/prisma'
import { getActivePlan, PLANS, PLAN_PRICES } from '@/lib/subscription'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Billing & Plans',
}

const features = {
  [PLANS.FREE]: [
    { name: 'Dashboard & Analytics', included: true },
    { name: 'Client & Project Management', included: true },
    { name: 'Financial Tracking', included: true },
    { name: 'Asset Management', included: true },
    { name: 'Email Invoices Directly', included: false },
    { name: 'Client Feedback Forms', included: false },
    { name: 'Access to ProdP', included: false },
    { name: 'Team Member Invites', included: false },
    { name: 'Realtime Messages', included: false },
  ],
  [PLANS.PRO]: [
    { name: 'Dashboard & Analytics', included: true },
    { name: 'Client & Project Management', included: true },
    { name: 'Financial Tracking', included: true },
    { name: 'Asset Management', included: true },
    { name: 'Email Invoices Directly', included: true },
    { name: 'Client Feedback Forms', included: true },
    { name: 'Access to ProdP', included: true },
    { name: 'Team Member Invites', included: false },
    { name: 'Realtime Messages', included: false },
  ],
  [PLANS.BUSINESS]: [
    { name: 'Dashboard & Analytics', included: true },
    { name: 'Client & Project Management', included: true },
    { name: 'Financial Tracking', included: true },
    { name: 'Asset Management', included: true },
    { name: 'Email Invoices Directly', included: true },
    { name: 'Client Feedback Forms', included: true },
    { name: 'Access to ProdP', included: true },
    { name: 'Team Member Invites', included: true },
    { name: 'Realtime Messages', included: true },
  ]
}

export default async function BillingPage() {
  const { orgId } = await auth()
  if (!orgId) redirect('/dashboard/select-business')

  const business = await prisma.business.findUnique({
    where: { id: orgId },
    select: { subscriptionPlan: true, subscriptionPeriodEnd: true }
  })

  if (!business) redirect('/dashboard/select-business')

  const activePlan = getActivePlan(business)

  return (
    <div className="max-w-7xl w-full mx-auto pb-24 space-y-8 md:space-y-12">
      <div className="border-b border-zinc-200 dark:border-white/10 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
          Billing & Subscription
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Manage your current plan and upgrade to unlock premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[PLANS.FREE, PLANS.PRO, PLANS.BUSINESS].map((plan) => {
          const isActive = activePlan === plan;
          const isUpgrade = plan !== PLANS.FREE && activePlan === PLANS.FREE; // Simplified logic
          
          return (
            <div key={plan} className={`flex flex-col p-6 rounded-2xl border ${isActive ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950`}>
              <div className="mb-4">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white capitalize">{plan.toLowerCase()}</h4>
                <div className="mt-2 flex items-baseline gap-x-2">
                  <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">৳{PLAN_PRICES[plan as keyof typeof PLAN_PRICES]}</span>
                  <span className="text-sm font-semibold leading-6 text-zinc-500">/month</span>
                </div>
              </div>
              
              <ul className="mt-8 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400 flex-1">
                {features[plan as keyof typeof features].map((feature) => (
                  <li key={feature.name} className="flex gap-x-3">
                    {feature.included ? (
                      <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    ) : (
                      <X className="h-6 w-5 flex-none text-zinc-400" aria-hidden="true" />
                    )}
                    <span className={feature.included ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}>{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                {isActive ? (
                  <button disabled className="w-full rounded-md bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-900 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <Link href={`/dashboard/settings/billing/checkout?plan=${plan}`} className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Upgrade to {plan.charAt(0) + plan.slice(1).toLowerCase()}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
