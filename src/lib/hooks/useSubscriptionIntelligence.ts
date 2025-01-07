import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  analyzeSubscriptionOptimizations,
  findAlternativeServices,
  detectSubscriptionRenewalRisks,
  type DetectedSubscription,
} from '../services/subscriptionDetection';
import type { Subscription } from '@/types/subscriptions';

interface UseSubscriptionIntelligenceProps {
  subscriptions: Subscription[];
  onUpdate?: () => void;
}

export function useSubscriptionIntelligence({
  subscriptions,
  onUpdate,
}: UseSubscriptionIntelligenceProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    optimizations: Awaited<ReturnType<typeof analyzeSubscriptionOptimizations>>;
    renewalRisks: Awaited<ReturnType<typeof detectSubscriptionRenewalRisks>>;
  } | null>(null);
  const { toast } = useToast();

  const analyzeSubscriptions = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      
      // Run all analyses in parallel
      const [optimizations, renewalRisks] = await Promise.all([
        analyzeSubscriptionOptimizations(subscriptions),
        detectSubscriptionRenewalRisks(subscriptions),
      ]);

      setAnalysis({
        optimizations,
        renewalRisks,
      });

      // Show toast with summary
      const totalSavings = optimizations.recommendations.reduce(
        (sum, rec) => sum + rec.potentialSavings,
        0
      );

      if (totalSavings > 0) {
        toast({
          title: 'Optimization Opportunities Found!',
          description: `We found potential savings of $${totalSavings.toFixed(2)} per month.`,
        });
      }

      // Check for high-priority renewal risks
      const highRisks = renewalRisks.filter((risk) => risk.riskLevel === 'high');
      if (highRisks.length > 0) {
        toast({
          title: 'Important Subscription Alerts',
          description: `You have ${highRisks.length} subscription${
            highRisks.length === 1 ? '' : 's'
          } that need attention.`,
          variant: 'destructive',
        });
      }

      onUpdate?.();
      return { optimizations, renewalRisks };
    } catch (error) {
      console.error('Error analyzing subscriptions:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze subscriptions at this time.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [subscriptions, toast, onUpdate]);

  const findAlternatives = useCallback(
    async (subscription: Subscription) => {
      try {
        const alternatives = await findAlternativeServices(subscription);
        
        if (alternatives && alternatives.length > 0) {
          const maxSavings = Math.max(...alternatives.map((alt) => alt.savings));
          toast({
            title: 'Alternatives Found',
            description: `We found potential savings of up to $${maxSavings.toFixed(
              2
            )} with alternative services.`,
          });
        }

        return alternatives;
      } catch (error) {
        console.error('Error finding alternatives:', error);
        toast({
          title: 'Search Failed',
          description: 'Unable to find alternative services at this time.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  return {
    isAnalyzing,
    analysis,
    analyzeSubscriptions,
    findAlternatives,
  };
} 