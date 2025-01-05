'use client';

import { useEffect, useState } from 'react';
import { useNexusMonitor } from '@/nexus/hooks';
import { Subscription } from '@/nexus/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, AlertCircle } from 'lucide-react';

export function SubscriptionOverview() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const monitor = useNexusMonitor('subscriptions');

  useEffect(() => {
    const unsubscribe = monitor.subscribe((data) => {
      setSubscriptions(data);
    });

    return () => unsubscribe();
  }, [monitor]);

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Subscriptions</CardTitle>
          <Badge variant="secondary">
            Total Monthly: {formatCurrency(totalMonthly)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{subscription.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{subscription.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Renews {subscription.renewalDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatCurrency(subscription.amount)}/mo
                  </span>
                  {subscription.status === 'warning' && (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 