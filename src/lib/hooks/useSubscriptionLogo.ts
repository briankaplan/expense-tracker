import { useState, useEffect } from 'react';
import { getSubscriptionLogo } from '../services/logoService';

export function useSubscriptionLogo(name: string, domain?: string) {
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLogo() {
      try {
        setIsLoading(true);
        setError(null);
        const url = await getSubscriptionLogo(name, domain);
        if (mounted) {
          setLogo(url);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch logo'));
          setLogo(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLogo();

    return () => {
      mounted = false;
    };
  }, [name, domain]);

  return {
    logo,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      return getSubscriptionLogo(name, domain);
    }
  };
} 