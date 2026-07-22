import { SubscriptionPlan } from "@prisma/client";

export const PLANS = {
  FREE: "FREE" as SubscriptionPlan,
  PRO: "PRO" as SubscriptionPlan,
  BUSINESS: "BUSINESS" as SubscriptionPlan,
};

// Plan Prices (in BDT)
export const PLAN_PRICES = {
  FREE: 0,
  PRO: 99,
  BUSINESS: 299,
};

export function isSubscriptionActive(business: { subscriptionPlan: SubscriptionPlan; subscriptionPeriodEnd: Date | null }) {
  if (business.subscriptionPlan === PLANS.FREE) return true;
  if (!business.subscriptionPeriodEnd) return false;
  return new Date() < business.subscriptionPeriodEnd;
}

export function getActivePlan(business: { subscriptionPlan: SubscriptionPlan; subscriptionPeriodEnd: Date | null }): SubscriptionPlan {
  if (isSubscriptionActive(business)) {
    return business.subscriptionPlan;
  }
  return PLANS.FREE; // Fallback to free if expired
}

// -----------------------------------------------------------------------------
// FEATURE GATING LOGIC
// -----------------------------------------------------------------------------

export function canSendEmails(plan: SubscriptionPlan) {
  return plan === PLANS.PRO || plan === PLANS.BUSINESS;
}

export function canUseFeedback(plan: SubscriptionPlan) {
  return plan === PLANS.PRO || plan === PLANS.BUSINESS;
}

export function canAccessProdP(plan: SubscriptionPlan) {
  return plan === PLANS.PRO || plan === PLANS.BUSINESS;
}

export function canInviteMembers(plan: SubscriptionPlan) {
  return plan === PLANS.BUSINESS;
}

export function canUseMessages(plan: SubscriptionPlan) {
  return plan === PLANS.BUSINESS;
}
