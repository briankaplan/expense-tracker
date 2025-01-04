import { useState, useEffect } from 'react';
import { NexusAutoFix } from '@/nexus/core/NexusAutoFix';

interface SystemState {
  isActive: boolean;
  lastUpdate: string;
  activeProcesses: {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'error';
    description: string;
  }[];
  recentEvents: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    description: string;
    timestamp: string;
  }[];
}

export function useNexusSystem() {
  const [systemState, setSystemState] = useState<SystemState>({
    isActive: false,
    lastUpdate: new Date().toISOString(),
    activeProcesses: [],
    recentEvents: []
  });

  const [autoFix, setAutoFix] = useState<NexusAutoFix | null>(null);

  useEffect(() => {
    // Initialize NexusAutoFix
    const initializeSystem = async () => {
      try {
        const nexusAutoFix = new NexusAutoFix();
        await nexusAutoFix.initialize();
        setAutoFix(nexusAutoFix);
        
        setSystemState(prev => ({
          ...prev,
          isActive: true,
          activeProcesses: [
            {
              id: 'ai-coordinator',
              name: 'AI Coordinator',
              status: 'active',
              description: 'Managing system intelligence'
            },
            {
              id: 'security-guard',
              name: 'Security Guard',
              status: 'active',
              description: 'Monitoring system security'
            },
            {
              id: 'auto-fix',
              name: 'Auto-Fix System',
              status: 'active',
              description: 'Maintaining code quality'
            }
          ]
        }));

        // Set up event listeners
        nexusAutoFix.on('fix-applied', (result) => {
          addEvent({
            type: 'success',
            title: 'Auto-Fix Applied',
            description: result.changes.join(', ')
          });
        });

        nexusAutoFix.on('fix-failed', (result) => {
          addEvent({
            type: 'error',
            title: 'Auto-Fix Failed',
            description: result.errors?.join(', ') || 'Unknown error occurred'
          });
        });

        nexusAutoFix.on('backup-created', ({ path }) => {
          addEvent({
            type: 'info',
            title: 'Backup Created',
            description: `Backup saved to ${path}`
          });
        });
      } catch (error) {
        console.error('Failed to initialize Nexus system:', error);
        setSystemState(prev => ({
          ...prev,
          isActive: false
        }));
      }
    };

    initializeSystem();

    // Cleanup
    return () => {
      if (autoFix) {
        // Remove event listeners
        autoFix.removeAllListeners();
      }
    };
  }, []);

  const addEvent = (event: Omit<SystemState['recentEvents'][0], 'id' | 'timestamp'>) => {
    setSystemState(prev => ({
      ...prev,
      recentEvents: [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          ...event
        },
        ...prev.recentEvents
      ].slice(0, 10) // Keep only the 10 most recent events
    }));
  };

  const runAutoFix = async () => {
    if (!autoFix) return;

    try {
      await autoFix.runAutoFix();
      addEvent({
        type: 'success',
        title: 'Auto-Fix Complete',
        description: 'Successfully ran system maintenance'
      });
    } catch (error) {
      addEvent({
        type: 'error',
        title: 'Auto-Fix Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  return {
    systemState,
    runAutoFix,
    addEvent
  };
} 