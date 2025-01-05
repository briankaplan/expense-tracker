'use client';

import { Card } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, CreditCard } from 'lucide-react';

export function ExpenseMetrics() {
  const metrics = [
    {
      title: 'Total Expenses',
      value: '$2,450.25',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Monthly Average',
      value: '$815.50',
      change: '-3.2%',
      trend: 'down',
      icon: CreditCard,
    },
    {
      title: 'Active Subscriptions',
      value: '8',
      change: '+1',
      trend: 'up',
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
            <div className="rounded-full bg-muted p-2">
              <metric.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {metric.trend === 'up' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {metric.change}
            </span>
            <span className="text-sm text-muted-foreground">from last month</span>
          </div>
        </Card>
      ))}
    </div>
  );
} 