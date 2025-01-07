export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  status: 'active' | 'paused' | 'canceled' | 'trial';
  nextBillingDate?: string;
  trialEndsAt?: string;
  lastUsedAt?: string;
  metadata?: {
    logo?: string;
    website?: string;
    features?: string[];
  };
  createdAt: string;
  updatedAt: string;
} 