import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';
import type { Receipt } from '@/types/receipts';
import { toast } from 'react-hot-toast';

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DatabaseService.getReceipts();
      setReceipts(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch receipts');
      console.error('Error fetching receipts:', error);
      setError(error);
      toast.error('Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return {
    receipts,
    isLoading,
    error,
    refetchReceipts: fetchReceipts
  };
} 