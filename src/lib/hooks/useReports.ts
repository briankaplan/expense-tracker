import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';
import type { Report } from '@/types/reports';
import { toast } from 'react-hot-toast';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DatabaseService.getReports();
      setReports(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch reports');
      console.error('Error fetching reports:', error);
      setError(error);
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    error,
    refetchReports: fetchReports
  };
} 