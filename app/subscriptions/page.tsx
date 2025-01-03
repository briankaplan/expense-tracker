import { type Metadata } from 'next';
import { SubscriptionsView } from '@/src/components/views/subscriptions/SubscriptionsView';

export const metadata: Metadata = {
  title: 'Subscriptions',
  description: 'Manage your recurring subscriptions'
};

// TODO: Replace with real data fetching
const mockSubscriptions = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly' as const,
    status: 'active' as const,
    nextBillingDate: '2024-02-15'
  },
  {
    id: '2',
    name: 'Adobe Creative Cloud',
    amount: 599.88,
    billingCycle: 'yearly' as const,
    status: 'active' as const,
    nextBillingDate: '2024-12-01'
  },
  {
    id: '3',
    name: 'Spotify',
    amount: 9.99,
    billingCycle: 'monthly' as const,
    status: 'canceled' as const,
    nextBillingDate: '2024-02-01'
  }
];

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-6">
      <SubscriptionsView subscriptions={mockSubscriptions} />
    </div>
  );
} 