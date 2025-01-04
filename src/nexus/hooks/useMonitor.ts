import { useState, useEffect } from 'react';
import { SystemState } from '../types/monitor';
import { UnifiedMonitor } from '../monitors/UnifiedMonitor';

let monitorInstance: UnifiedMonitor | null = null;

export function useMonitor() {
  const [state, setState] = useState<SystemState | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!monitorInstance) {
      try {
        monitorInstance = new UnifiedMonitor();
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return;
      }
    }

    const handleUpdate = (event: CustomEvent<{ state: SystemState }>) => {
      setState(event.detail.state);
      setIsLoading(false);
    };

    const handleError = (error: Error) => {
      setError(error);
      setIsLoading(false);
    };

    // Start monitoring
    monitorInstance.startMonitoring().catch(handleError);

    // Listen for updates
    window.addEventListener('monitor-update', handleUpdate as EventListener);

    // Get initial state
    setState(monitorInstance.getState());
    setIsLoading(false);

    return () => {
      window.removeEventListener('monitor-update', handleUpdate as EventListener);
    };
  }, []);

  const getComponentState = <K extends keyof SystemState>(
    component: K
  ): SystemState[K] | null => {
    return state ? state[component] : null;
  };

  const getLastUpdate = (component: keyof SystemState): string | undefined => {
    return monitorInstance?.getLastUpdate(component);
  };

  return {
    state,
    error,
    isLoading,
    getComponentState,
    getLastUpdate
  };
} 