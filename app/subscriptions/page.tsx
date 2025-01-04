'use client';

import { SubscriptionView } from '@/components/views/subscriptions/SubscriptionView';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

// TODO: Replace with actual data fetching and AI processing
const mockSubscriptions = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    status: 'active',
    paymentMethod: 'Visa •••• 4242',
    logoUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png'
  },
  {
    id: '2',
    name: 'Adobe Creative Cloud',
    amount: 599.88,
    billingCycle: 'yearly',
    nextBillingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Software',
    status: 'active',
    paymentMethod: 'Mastercard •••• 8888',
    logoUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/2_Adobe_logo-512.png'
  },
  {
    id: '3',
    name: 'Spotify',
    amount: 9.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    status: 'active',
    paymentMethod: 'PayPal',
    logoUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/315_Spotify_logo-512.png'
  },
  {
    id: '4',
    name: 'Gym Membership',
    amount: 49.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Health',
    status: 'paused',
    paymentMethod: 'Visa •••• 1234'
  },
  {
    id: '5',
    name: 'Apple One',
    amount: 29.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Software',
    status: 'active',
    paymentMethod: 'Apple Pay',
    logoUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/23_Apple_logo-512.png'
  }
] as const;

export default function SubscriptionsPage() {
  const handleAddSubscription = useCallback(() => {
    // TODO: Implement subscription addition with AI assistance
    toast.success('Adding new subscription');
  }, []);

  const handleEditSubscription = useCallback((id: string) => {
    // TODO: Implement subscription editing
    toast.success(`Editing subscription ${id}`);
  }, []);

  const handleCancelSubscription = useCallback((id: string) => {
    // TODO: Implement subscription cancellation
    toast.success(`Canceling subscription ${id}`);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <SubscriptionView
        subscriptions={mockSubscriptions}
        onAddSubscription={handleAddSubscription}
        onEditSubscription={handleEditSubscription}
        onCancelSubscription={handleCancelSubscription}
      />
    </div>
  );
} 