'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatCurrency } from '@/src/lib/utils';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'pending';
  nextBillingDate: string;
}

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
}

export function SubscriptionsView({ subscriptions }: SubscriptionsViewProps) {
  const totalMonthly = subscriptions
    .filter(sub => sub.status === 'active' && sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const totalYearly = subscriptions
    .filter(sub => sub.status === 'active' && sub.billingCycle === 'yearly')
    .reduce((sum, sub) => sum + (sub.amount / 12), 0);

  const totalMonthlySpend = totalMonthly + totalYearly;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Monthly Spend
          </CardTitle>
          <Badge variant="secondary">Monthly</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpend)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {subscription.name}
              </CardTitle>
              <Badge
                variant={
                  subscription.status === 'active' ? 'success' :
                  subscription.status === 'canceled' ? 'error' : 
                  'warning'
                }
              >
                {subscription.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(subscription.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription.billingCycle} • Next billing: {subscription.nextBillingDate}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 