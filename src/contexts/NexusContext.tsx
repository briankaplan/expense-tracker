'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface SystemStatus {
  initialized: boolean;
  lastCheck: string;
  activeFeatures: string[];
  pendingTasks: string[];
}

interface AIStatus {
  lastSuggestion: string | null;
  pendingSuggestions: string[];
}

interface NexusState {
  systemStatus: SystemStatus;
  aiStatus: AIStatus;
}

interface NexusContextType {
  state: NexusState;
  runCommand: (command: string) => Promise<void>;
}

const initialState: NexusState = {
  systemStatus: {
    initialized: false,
    lastCheck: new Date().toISOString(),
    activeFeatures: [],
    pendingTasks: []
  },
  aiStatus: {
    lastSuggestion: null,
    pendingSuggestions: []
  }
};

const NexusContext = createContext<NexusContextType | null>(null);

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NexusState>(initialState);

  const runCommand = useCallback(async (command: string) => {
    // TODO: Implement command execution
    console.log('Running command:', command);
  }, []);

  return (
    <NexusContext.Provider value={{ state, runCommand }}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus(): NexusContextType {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
} 