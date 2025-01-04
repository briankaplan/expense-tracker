'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  status: string;
  paymentMethod: string;
  logoUrl?: string;
}

interface SubscriptionViewProps {
  subscriptions: Subscription[];
  onAddSubscription: () => void;
  onEditSubscription: (id: string) => void;
  onCancelSubscription: (id: string) => void;
}

const BILLING_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annual', value: 'yearly' },
  { label: 'Trials', value: 'trial' }
] as const;

export function SubscriptionView({
  subscriptions,
  onAddSubscription,
  onEditSubscription,
  onCancelSubscription,
}: SubscriptionViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [billingFilter, setBillingFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const totalMonthly = subscriptions
      .filter(sub => sub.status === 'active' && sub.billingCycle === 'monthly')
      .reduce((sum, sub) => sum + sub.amount, 0);

    const totalYearly = subscriptions
      .filter(sub => sub.status === 'active' && sub.billingCycle === 'yearly')
      .reduce((sum, sub) => sum + sub.amount, 0);

    const monthlyEquivalent = totalYearly / 12 + totalMonthly;

    return {
      totalMonthly,
      totalYearly,
      monthlyEquivalent,
      activeCount: subscriptions.filter(sub => sub.status === 'active').length,
      pausedCount: subscriptions.filter(sub => sub.status === 'paused').length,
    };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      if (billingFilter === 'all') return true;
      return sub.billingCycle === billingFilter;
    });
  }, [subscriptions, billingFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button onClick={onAddSubscription}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Spend</h3>
          <p className="text-2xl font-bold">${stats.monthlyEquivalent.toFixed(2)}</p>
          <p className="text-sm text-gray-500">
            Monthly: ${stats.totalMonthly.toFixed(2)}
            <br />
            Yearly: ${stats.totalYearly.toFixed(2)} (${(stats.totalYearly / 12).toFixed(2)}/mo)
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <p className="text-2xl font-bold">{stats.activeCount}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Paused Subscriptions</h3>
          <p className="text-2xl font-bold">{stats.pausedCount}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Next Payment</h3>
          <div className="mt-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Select value={billingFilter} onValueChange={setBillingFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by billing cycle" />
          </SelectTrigger>
          <SelectContent>
            {BILLING_FILTERS.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredSubscriptions.map(subscription => (
          <Card key={subscription.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {subscription.logoUrl ? (
                  <div className="w-12 h-12 relative">
                    <Image
                      src={subscription.logoUrl}
                      alt={subscription.name}
                      fill
                      className="rounded-lg object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-500">
                      {subscription.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{subscription.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${subscription.amount} / {subscription.billingCycle}
                  </p>
                  <p className="text-sm text-gray-500">
                    Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Category: {subscription.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment: {subscription.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSubscription(subscription.id)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancelSubscription(subscription.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {subscription.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 