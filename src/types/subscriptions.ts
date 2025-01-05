export type SubscriptionFrequency = 'monthly' | 'yearly' | 'quarterly' | 'weekly';
export type SubscriptionStatus = 'active' | 'canceled' | 'paused' | 'past_due';
export type SubscriptionCategory = 'software' | 'streaming' | 'utilities' | 'memberships' | 'other';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  lastBillingDate?: string;
  canceledAt?: string;
  metadata?: {
    website?: string;
    logo?: string;
    color?: string;
  };
  reminderEnabled: boolean;
  reminderDays: number;
  autoRenewal: boolean;
  notes?: string;
} 