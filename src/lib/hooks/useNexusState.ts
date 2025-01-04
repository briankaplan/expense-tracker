import { useQuery } from '@tanstack/react-query';
import { getNexusStatus } from '@/lib/services/nexus';

interface NexusState {
  isRunning: boolean;
  lastSync: string | null;
  activeFeatures: string[];
  errors: string[];
}

export function useNexusState() {
  const { data: state = defaultState, isLoading, error } = useQuery<NexusState>({
    queryKey: ['nexusState'],
    queryFn: getNexusStatus,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  return {
    state,
    isLoading,
    error,
  };
}

const defaultState: NexusState = {
  isRunning: false,
  lastSync: null,
  activeFeatures: [],
  errors: [],
}; 