import { useState, useCallback } from 'react';
import { TellerConnect, TellerConnectOptions } from '@/lib/services/teller';
import { TELLER_APP_ID, TELLER_ENV } from '@/lib/config';

interface TellerHookResult {
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  resync: () => Promise<void>;
  openTellerConnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  error: Error | null;
  enrollment: any;
  lastSynced: string | null;
  autoSyncEnabled: boolean;
  toggleAutoSync: () => void;
}

export function useTeller(): TellerHookResult {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  const openTellerConnect = useCallback(() => {
    setIsConnecting(true);
    setError(null);

    try {
      const options: TellerConnectOptions = {
        applicationId: TELLER_APP_ID,
        environment: TELLER_ENV,
        onSuccess: (enrollment) => {
          console.log('Successfully connected bank account:', enrollment);
          setEnrollment(enrollment);
          setIsConnected(true);
          setIsConnecting(false);
          setLastSynced(new Date().toISOString());
        },
        onExit: () => {
          console.log('User exited Teller Connect');
          setIsConnecting(false);
        },
        onError: (err) => {
          console.error('Error connecting bank account:', err);
          setError(err instanceof Error ? err : new Error('Failed to connect bank account'));
          setIsConnecting(false);
        },
      };

      const teller = new TellerConnect(options);
      teller.open();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Teller Connect'));
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(() => {
    openTellerConnect();
  }, [openTellerConnect]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setEnrollment(null);
    setLastSynced(null);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  const resync = useCallback(async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    try {
      // Implement sync logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated sync
      setLastSynced(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sync accounts'));
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);

  const toggleAutoSync = useCallback(() => {
    setAutoSyncEnabled(prev => !prev);
  }, []);

  return {
    connect,
    disconnect,
    reconnect,
    resync,
    openTellerConnect,
    isConnecting,
    isConnected,
    isSyncing,
    error,
    enrollment,
    lastSynced,
    autoSyncEnabled,
    toggleAutoSync,
  };
} 