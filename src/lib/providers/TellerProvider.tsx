'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { TellerConnect, TellerConnectOptions } from '@/lib/services/teller';
import { TELLER_APP_ID, TELLER_ENV } from '@/lib/config';

interface TellerContextType {
  isConnecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

const TellerContext = createContext<TellerContextType | undefined>(undefined);

export function TellerProvider({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    setIsConnecting(true);
    setError(null);

    const options: TellerConnectOptions = {
      environment: TELLER_ENV,
      applicationId: TELLER_APP_ID!,
      onSuccess: (enrollment) => {
        console.log('Successfully connected account:', enrollment);
        setIsConnecting(false);
      },
      onExit: () => {
        console.log('User exited Teller Connect');
        setIsConnecting(false);
      },
      onError: (error) => {
        console.error('Error connecting account:', error);
        setError(error);
        setIsConnecting(false);
      },
    };

    TellerConnect.setup(options);
    TellerConnect.open();
  }, []);

  const disconnect = useCallback(() => {
    // Implement disconnect logic
  }, []);

  return (
    <TellerContext.Provider value={{ isConnecting, error, connect, disconnect }}>
      {children}
    </TellerContext.Provider>
  );
}

export function useTeller() {
  const context = useContext(TellerContext);
  if (context === undefined) {
    throw new Error('useTeller must be used within a TellerProvider');
  }
  return context;
} 