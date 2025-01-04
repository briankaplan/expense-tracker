import { useState, useCallback } from 'react';
import {
  detectSubscriptionsFromEmails,
  detectSubscriptionsFromReceipts,
  detectSubscriptionsFromAppleReceipts,
  detectSubscriptionsFromGooglePlay,
  analyzeSubscriptionPattern,
} from '../services/subscriptionDetection';
import { useToast } from '../../components/ui/use-toast';

interface UseSubscriptionDetectionProps {
  onDetectionComplete?: (subscriptions: any[]) => void;
}

export function useSubscriptionDetection({ onDetectionComplete }: UseSubscriptionDetectionProps = {}) {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const detectFromEmails = useCallback(async (emails: string[]) => {
    try {
      setIsDetecting(true);
      const subscriptions = await detectSubscriptionsFromEmails(emails);
      onDetectionComplete?.(subscriptions);
      toast({
        title: 'Detection Complete',
        description: `Found ${subscriptions.length} subscriptions in your emails.`,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error detecting subscriptions from emails:', error);
      toast({
        title: 'Detection Failed',
        description: 'Failed to analyze emails for subscriptions.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [onDetectionComplete, toast]);

  const detectFromReceipts = useCallback(async (receiptTexts: string[]) => {
    try {
      setIsDetecting(true);
      const subscriptions = await detectSubscriptionsFromReceipts(receiptTexts);
      onDetectionComplete?.(subscriptions);
      toast({
        title: 'Detection Complete',
        description: `Found ${subscriptions.length} subscriptions in your receipts.`,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error detecting subscriptions from receipts:', error);
      toast({
        title: 'Detection Failed',
        description: 'Failed to analyze receipts for subscriptions.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [onDetectionComplete, toast]);

  const detectFromAppleReceipts = useCallback(async () => {
    try {
      setIsDetecting(true);
      const subscriptions = await detectSubscriptionsFromAppleReceipts();
      onDetectionComplete?.(subscriptions);
      toast({
        title: 'Detection Complete',
        description: `Found ${subscriptions.length} Apple subscriptions.`,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error detecting Apple subscriptions:', error);
      toast({
        title: 'Detection Failed',
        description: 'Failed to analyze Apple subscriptions.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [onDetectionComplete, toast]);

  const detectFromGooglePlay = useCallback(async () => {
    try {
      setIsDetecting(true);
      const subscriptions = await detectSubscriptionsFromGooglePlay();
      onDetectionComplete?.(subscriptions);
      toast({
        title: 'Detection Complete',
        description: `Found ${subscriptions.length} Google Play subscriptions.`,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error detecting Google Play subscriptions:', error);
      toast({
        title: 'Detection Failed',
        description: 'Failed to analyze Google Play subscriptions.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [onDetectionComplete, toast]);

  const detectFromTransactions = useCallback(async (transactions: any[]) => {
    try {
      setIsDetecting(true);
      const subscriptions = await analyzeSubscriptionPattern(transactions);
      onDetectionComplete?.(subscriptions);
      toast({
        title: 'Analysis Complete',
        description: `Found ${subscriptions.length} potential subscriptions in your transactions.`,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error analyzing transaction patterns:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze transaction patterns.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [onDetectionComplete, toast]);

  return {
    isDetecting,
    detectFromEmails,
    detectFromReceipts,
    detectFromAppleReceipts,
    detectFromGooglePlay,
    detectFromTransactions,
  };
} 