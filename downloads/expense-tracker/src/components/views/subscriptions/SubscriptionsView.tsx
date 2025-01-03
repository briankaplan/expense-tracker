'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function SubscriptionsView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <Button variant="primary">Add Subscription</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Subscription cards will go here */}
      </div>
    </div>
  );
} 