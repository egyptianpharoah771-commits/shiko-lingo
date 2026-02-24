/**
 * Subscription Adapter (Domain Constants Only)
 * ---------------------------------------------
 * Supabase subscriptions table is the Single Source of Truth.
 * This file now defines only domain-level plan constants.
 */

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  MONTHLY: "monthly",
  LIFETIME: "lifetime",
};