import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Subscription } from '@/types/subscriptions';
import { detectSubscriptionRenewalRisks } from '../services/subscriptionDetection';

interface SubscriptionAlert {
  id: string;
  type: 'renewal' | 'price_increase' | 'trial_ending' | 'unused' | 'alternative';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  date?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useSubscriptionNotifications(subscriptions: Subscription[]) {
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const { toast } = useToast();

  const checkForAlerts = useCallback(async () => {
    try {
      const newAlerts: SubscriptionAlert[] = [];

      // Check for renewals and risks
      const risks = await detectSubscriptionRenewalRisks(subscriptions);
      
      risks.forEach(risk => {
        newAlerts.push({
          id: `risk-${risk.subscriptionId}`,
          type: 'renewal',
          title: 'Subscription Alert',
          description: risk.reason,
          priority: risk.riskLevel,
          date: risk.deadline,
          action: {
            label: 'View Details',
            onClick: () => {
              // Handle viewing subscription details
            }
          }
        });
      });

      // Check for trial periods ending soon
      subscriptions.forEach(sub => {
        if (sub.status === 'trial') {
          const trialEnd = new Date(sub.trialEndsAt || '');
          const daysUntilEnd = Math.ceil(
            (trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
            newAlerts.push({
              id: `trial-${sub.id}`,
              type: 'trial_ending',
              title: 'Trial Period Ending',
              description: `Your trial for ${sub.name} will end in ${daysUntilEnd} days.`,
              priority: 'high',
              date: sub.trialEndsAt,
              action: {
                label: 'Review Subscription',
                onClick: () => {
                  // Handle reviewing subscription
                }
              }
            });
          }
        }
      });

      // Check for upcoming renewals
      subscriptions.forEach(sub => {
        if (sub.status === 'active' && sub.nextBillingDate) {
          const nextBilling = new Date(sub.nextBillingDate);
          const daysUntilBilling = Math.ceil(
            (nextBilling.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilBilling <= 7 && daysUntilBilling > 0) {
            newAlerts.push({
              id: `renewal-${sub.id}`,
              type: 'renewal',
              title: 'Upcoming Renewal',
              description: `${sub.name} will renew in ${daysUntilBilling} days (${
                sub.frequency === 'monthly' ? 'Monthly' : 'Annual'
              } - ${sub.amount.toFixed(2)})`,
              priority: daysUntilBilling <= 3 ? 'high' : 'medium',
              date: sub.nextBillingDate,
              action: {
                label: 'Review Renewal',
                onClick: () => {
                  // Handle reviewing renewal
                }
              }
            });
          }
        }
      });

      // Check for unused subscriptions
      subscriptions.forEach(sub => {
        if (sub.status === 'active' && sub.lastUsedAt) {
          const lastUsed = new Date(sub.lastUsedAt);
          const daysSinceUsed = Math.ceil(
            (new Date().getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceUsed >= 30) {
            newAlerts.push({
              id: `unused-${sub.id}`,
              type: 'unused',
              title: 'Unused Subscription',
              description: `You haven't used ${sub.name} in ${daysSinceUsed} days.`,
              priority: 'medium',
              action: {
                label: 'Review Usage',
                onClick: () => {
                  // Handle reviewing usage
                }
              }
            });
          }
        }
      });

      // Update alerts
      setAlerts(newAlerts);

      // Show toast for high priority alerts
      const highPriorityAlerts = newAlerts.filter(alert => alert.priority === 'high');
      if (highPriorityAlerts.length > 0) {
        toast({
          title: 'Important Subscription Alerts',
          description: `You have ${highPriorityAlerts.length} high-priority subscription alerts that need attention.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking for subscription alerts:', error);
    }
  }, [subscriptions, toast]);

  // Check for alerts on mount and when subscriptions change
  useEffect(() => {
    checkForAlerts();
  }, [checkForAlerts]);

  // Set up periodic checks (every hour)
  useEffect(() => {
    const interval = setInterval(checkForAlerts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkForAlerts]);

  return {
    alerts,
    checkForAlerts,
    clearAlert: (id: string) => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    },
    clearAllAlerts: () => {
      setAlerts([]);
    }
  };
} 