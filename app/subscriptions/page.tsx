'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  name: string;
  color: string;
  enabled: boolean;
  description: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  status: 'active' | 'inactive' | 'trial' | 'unsubscribed';
  trialEndsAt?: Date;
}

const defaultSubscriptions: Subscription[] = [
  {
    name: 'Netflix',
    color: '#E50914',
    enabled: true,
    description: 'Streaming service subscription',
    amount: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(2024, 2, 15),
    status: 'active',
  },
  {
    name: 'Spotify',
    color: '#1DB954',
    enabled: true,
    description: 'Music streaming service',
    amount: 9.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(2024, 2, 20),
    status: 'trial',
    trialEndsAt: new Date(2024, 3, 20),
  },
  {
    name: 'Adobe Creative Cloud',
    color: '#FF0000',
    enabled: false,
    description: 'Design software suite',
    amount: 52.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(2024, 2, 25),
    status: 'unsubscribed',
  },
  {
    name: 'AWS',
    color: '#FF9900',
    enabled: true,
    description: 'Cloud services',
    amount: 150.00,
    billingCycle: 'monthly',
    nextBillingDate: new Date(2024, 2, 1),
    status: 'active',
  },
];

type StatusFilter = 'all' | 'active' | 'trial' | 'inactive' | 'unsubscribed';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(defaultSubscriptions);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const totalMonthly = subscriptions
    .filter(sub => (sub.status === 'active' || sub.status === 'trial') && sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'unsubscribed':
        return <Badge variant="destructive">Unsubscribed</Badge>;
    }
  };

  // Sort subscriptions by next billing date
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => 
    a.nextBillingDate.getTime() - b.nextBillingDate.getTime()
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Monthly Total: ${totalMonthly.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
          <Button variant="outline">
            Subscribe
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'trial', 'inactive', 'unsubscribed'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedSubscriptions.map((subscription) => (
          <Card key={subscription.name} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-1 h-full" 
              style={{ backgroundColor: subscription.color }}
            />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{subscription.name}</CardTitle>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
              <CardDescription>{subscription.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-mono font-medium">
                    ${subscription.amount.toFixed(2)} / {subscription.billingCycle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next payment:</span>
                  <span>{format(subscription.nextBillingDate, 'MMM d, yyyy')}</span>
                </div>
                {subscription.status === 'trial' && subscription.trialEndsAt && (
                  <div className="flex justify-between text-blue-500">
                    <span>Trial ends:</span>
                    <span>{format(subscription.trialEndsAt, 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 