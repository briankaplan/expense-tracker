'use client';

import { createContext, useContext, useState } from 'react';
import { TellerConnect } from '@/lib/teller';

type TellerContextType = {
  isConnecting: boolean;
  startConnection: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const TellerContext = createContext<TellerContextType>({
  isConnecting: false,
  startConnection: async () => {},
  disconnect: async () => {},
});

export function useTeller() {
  return useContext(TellerContext);
}

export function TellerProvider({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const startConnection = async () => {
    setIsConnecting(true);
    try {
      const teller = new TellerConnect({
        applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID!,
        environment: process.env.NEXT_PUBLIC_TELLER_ENV as 'development' | 'production',
        onSuccess: (enrollment) => {
          console.log('Teller connection success:', enrollment);
          setIsConnecting(false);
        },
        onExit: () => {
          console.log('Teller connection exited');
          setIsConnecting(false);
        },
        onEvent: (event) => {
          console.log('Teller event:', event);
        },
      });

      await teller.setup();
      await teller.open();
    } catch (error) {
      console.error('Failed to start Teller connection:', error);
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    // TODO: Implement disconnect logic
    console.log('Disconnecting from Teller...');
  };

  return (
    <TellerContext.Provider
      value={{
        isConnecting,
        startConnection,
        disconnect,
      }}
    >
      {children}
    </TellerContext.Provider>
  );
} 