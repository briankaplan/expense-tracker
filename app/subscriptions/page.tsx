import { SubscriptionsView } from '@/components/views/subscriptions/SubscriptionsView';

export const metadata = {
  title: 'Subscriptions | Expense Manager',
  description: 'Manage your recurring expenses and subscriptions',
};

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-6">
      <SubscriptionsView />
    </div>
  );
} 