'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { type Subscription } from '@/types/subscriptions';
import { SubscriptionLogo } from '@/components/ui/subscription-logo';
import { motion } from 'framer-motion';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onFindAlternatives: (subscription: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onFindAlternatives,
}: SubscriptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className="relative group">
            <SubscriptionLogo
              name={subscription.name}
              domain={subscription.metadata?.website}
              size="lg"
              className="transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{subscription.name}</h3>
                {subscription.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subscription.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {subscription.category}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {subscription.frequency}
                  </Badge>
                  <Badge
                    variant={subscription.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    per {subscription.frequency}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFindAlternatives(subscription)}
                  >
                    Find Alternatives
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subscription)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {subscription.metadata?.website && (
              <a
                href={subscription.metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {new URL(subscription.metadata.website).hostname}
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 