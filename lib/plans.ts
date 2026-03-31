/**
 * ── CENTRALIZED PLAN CONFIGURATION ──────────────────────────────────────────
 * This is the SINGLE SOURCE OF TRUTH for all tiers, pricing, and limits.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PlanId = 'free' | 'plus' | 'pro' | 'enterprise';

export interface PlanConfig {
    id: PlanId;
    label: string;
    price: number;
    priceLabel: string;
    dailyLimit: number;
    features: string[];
    accentColor: string;
    bgClass: string;
    borderClass: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
    free: {
        id: 'free',
        label: 'Hobbyist',
        price: 0,
        priceLabel: '$0 / 24h',
        dailyLimit: 20,
        features: ['20 API Calls / Day', 'Standard Social Tools', 'Public Community Support', 'CORS Enabled'],
        accentColor: 'text-slate-400',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        borderClass: 'border-slate-200 dark:border-slate-800'
    },
    plus: {
        id: 'plus',
        label: 'Plus Plan',
        price: 10,
        priceLabel: '$10 / month',
        dailyLimit: 100,
        features: ['100 API Calls / Day', 'All Social Tools', 'Priority Support', 'No Rate Limiting (Burst Allowed)'],
        accentColor: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-900/10',
        borderClass: 'border-blue-200 dark:border-blue-800'
    },
    pro: {
        id: 'pro',
        label: 'Pro Developer',
        price: 30, // Current $1/day
        priceLabel: '$30 / month',
        dailyLimit: 500,
        features: ['500 API Calls / Day', 'Full AI Suite Access', 'Priority Image Processing', 'Premium Dev Support'],
        accentColor: 'text-indigo-600 dark:text-indigo-400',
        bgClass: 'bg-indigo-600',
        borderClass: 'border-indigo-500'
    },
    enterprise: {
        id: 'enterprise',
        label: 'Enterprise',
        price: 0,
        priceLabel: 'Custom',
        dailyLimit: 99999,
        features: ['Unlimited API Scalability', 'Custom Route Implementation', 'SLA Guaranteed 99.9% Uptime', 'Dedicated Account Manager'],
        accentColor: 'text-violet-600 dark:text-violet-400',
        bgClass: 'bg-slate-900 dark:bg-white',
        borderClass: 'border-slate-800 dark:border-slate-200'
    }
};

export const DEFAULT_PLAN = PLANS.free;
