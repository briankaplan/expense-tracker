'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TellerConnect, TellerConnectOptions } from 'teller-connect-react';
import { toast } from 'react-hot-toast';

interface TellerContextType {
  openTellerConnect: () => void;
  reconnect: () => void;
  resync: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  accessToken: string | null;
  enrollment: any | null;
  lastSynced: Date | null;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  toggleAutoSync: () => void;
}

const TellerContext = createContext<TellerContextType>({
  openTellerConnect: () => {},
  reconnect: () => {},
  resync: async () => {},
  disconnect: () => {},
  isConnected: false,
  accessToken: null,
  enrollment: null,
  lastSynced: null,
  isSyncing: false,
  autoSyncEnabled: true,
  toggleAutoSync: () => {},
});

const TELLER_APP_ID = process.env.NEXT_PUBLIC_TELLER_APP_ID;
const TELLER_ENV = process.env.NEXT_PUBLIC_TELLER_ENV || 'sandbox';
const STORAGE_KEY = 'teller_connection';
const AUTO_SYNC_KEY = 'teller_auto_sync';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface StoredConnection {
  accessToken: string;
  enrollment: any;
  lastSynced: string;
}

export function TellerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(AUTO_SYNC_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Load stored connection on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const { accessToken, enrollment, lastSynced } = JSON.parse(storedData) as StoredConnection;
        setAccessToken(accessToken);
        setEnrollment(enrollment);
        setLastSynced(new Date(lastSynced));
      } catch (error) {
        console.error('Error loading stored connection:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save connection data when it changes
  useEffect(() => {
    if (accessToken && enrollment) {
      const dataToStore: StoredConnection = {
        accessToken,
        enrollment,
        lastSynced: lastSynced?.toISOString() || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    }
  }, [accessToken, enrollment, lastSynced]);

  // Save auto-sync preference
  useEffect(() => {
    localStorage.setItem(AUTO_SYNC_KEY, autoSyncEnabled.toString());
  }, [autoSyncEnabled]);

  // Automatic daily sync
  useEffect(() => {
    if (!accessToken || !autoSyncEnabled) return;

    const checkAndSync = async () => {
      const now = new Date();
      const lastSync = lastSynced || new Date(0);
      const timeSinceLastSync = now.getTime() - lastSync.getTime();

      if (timeSinceLastSync >= ONE_DAY_MS) {
        await resync();
      }
    };

    // Check on mount and when dependencies change
    checkAndSync();

    // Set up interval for periodic checks
    const interval = setInterval(checkAndSync, ONE_DAY_MS);
    
    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [accessToken, lastSynced, autoSyncEnabled, resync]);

  const onSuccess = useCallback((enrollment: any) => {
    console.log('Teller Connect success:', enrollment);
    setAccessToken(enrollment.accessToken);
    setEnrollment(enrollment);
    setLastSynced(new Date());
    setIsOpen(false);
    toast.success('Successfully connected to bank account');
  }, []);

  const onExit = useCallback(() => {
    console.log('Teller Connect exited');
    setIsOpen(false);
  }, []);

  const openTellerConnect = useCallback(() => {
    setIsOpen(true);
  }, []);

  const reconnect = useCallback(() => {
    setAccessToken(null);
    setEnrollment(null);
    localStorage.removeItem(STORAGE_KEY);
    openTellerConnect();
  }, [openTellerConnect]);

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setEnrollment(null);
    setLastSynced(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Disconnected from bank account');
  }, []);

  const toggleAutoSync = useCallback(() => {
    setAutoSyncEnabled(prev => !prev);
    toast.success(autoSyncEnabled ? 'Auto-sync disabled' : 'Auto-sync enabled');
  }, [autoSyncEnabled]);

  const resync = useCallback(async () => {
    if (!accessToken) return;
    
    setIsSyncing(true);
    try {
      // Verify the connection is still valid
      const response = await fetch(`${process.env.NEXT_PUBLIC_TELLER_API_URL}/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Connection expired');
      }
      
      setLastSynced(new Date());
      toast.success('Successfully resynced bank data');
    } catch (error) {
      console.error('Error resyncing:', error);
      toast.error('Failed to resync. Please reconnect your bank account.');
      reconnect();
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, reconnect]);

  const config: TellerConnectOptions = {
    appId: TELLER_APP_ID!,
    environment: TELLER_ENV as 'sandbox' | 'development' | 'production',
    onSuccess,
    onExit,
  };

  return (
    <TellerContext.Provider
      value={{
        openTellerConnect,
        reconnect,
        resync,
        disconnect,
        isConnected: !!accessToken,
        accessToken,
        enrollment,
        lastSynced,
        isSyncing,
        autoSyncEnabled,
        toggleAutoSync,
      }}
    >
      {children}
      {isOpen && <TellerConnect {...config} />}
    </TellerContext.Provider>
  );
}

export function useTeller() {
  const context = useContext(TellerContext);
  if (!context) {
    throw new Error('useTeller must be used within a TellerProvider');
  }
  return context;
} 