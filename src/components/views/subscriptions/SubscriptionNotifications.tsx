'use client';

import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useSubscriptionNotifications } from '@/lib/hooks/useSubscriptionNotifications';
import type { Subscription } from '@/types/subscriptions';

interface SubscriptionNotificationsProps {
  subscriptions: Subscription[];
}

export function SubscriptionNotifications({ subscriptions }: SubscriptionNotificationsProps) {
  const { alerts, clearAlert, clearAllAlerts } = useSubscriptionNotifications(subscriptions);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Subscription Alerts</h3>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={clearAllAlerts}>
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              flex items-start justify-between p-3 rounded-lg
              ${
                alert.priority === 'high'
                  ? 'bg-destructive/10'
                  : alert.priority === 'medium'
                  ? 'bg-yellow-500/10'
                  : 'bg-muted'
              }
            `}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{alert.title}</h4>
                <Badge
                  variant={
                    alert.priority === 'high'
                      ? 'destructive'
                      : alert.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {alert.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.description}</p>
              {alert.date && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(alert.date)}
                </p>
              )}
              {alert.action && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto font-normal"
                  onClick={alert.action.onClick}
                >
                  {alert.action.label}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => clearAlert(alert.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
} 