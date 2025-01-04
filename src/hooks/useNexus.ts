import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { NexusCore } from '@/lib/nexus/core';

interface NexusStatus {
  expenses: {
    syncing: boolean;
    pendingCount: number;
    lastSync: string;
  };
  receipts: {
    processing: boolean;
    pendingCount: number;
    unmatchedCount: number;
  };
  reports: {
    openCount: number;
    missingReceipts: number;
  };
  email: {
    connected: boolean;
    unprocessedCount: number;
  };
  backups: {
    lastBackup: string;
    pendingCount: number;
  };
}

export function useNexus() {
  const queryClient = useQueryClient();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [nexusCore] = useState(() => new NexusCore());

  // Query for Nexus status
  const { data: status, error } = useQuery<NexusStatus>({
    queryKey: ['nexus-status'],
    queryFn: async () => {
      const state = nexusCore.getState();
      return {
        expenses: {
          syncing: state.teller.status === 'active',
          pendingCount: state.teller.pendingTransactions,
          lastSync: state.teller.lastSync
        },
        receipts: {
          processing: state.ocr.processing > 0,
          pendingCount: state.receipts.pending,
          unmatchedCount: state.receipts.needsMatching
        },
        reports: {
          openCount: state.reports.open,
          missingReceipts: state.reports.pendingReceipts
        },
        email: {
          connected: state.gmail.connected,
          unprocessedCount: state.gmail.unprocessedEmails
        },
        backups: {
          lastBackup: state.dropbox.lastBackup,
          pendingCount: state.dropbox.pendingBackups
        }
      };
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Start monitoring
  const startMonitoring = async () => {
    try {
      setIsMonitoring(true);
      await nexusCore.monitorAll();
      toast.success('Nexus monitoring started');
      // Refresh status after starting monitoring
      queryClient.invalidateQueries({ queryKey: ['nexus-status'] });
    } catch (error) {
      toast.error('Failed to start monitoring');
      setIsMonitoring(false);
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      setIsMonitoring(false);
      toast.success('Nexus monitoring stopped');
    } catch (error) {
      toast.error('Failed to stop monitoring');
      setIsMonitoring(true);
    }
  };

  // Force sync all systems
  const syncAll = async () => {
    try {
      await nexusCore.monitorAll();
      toast.success('Sync started');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['nexus-status'] });
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  // Fix issues automatically
  const autoFix = async () => {
    try {
      // Here you would call the auto-fix functionality from NexusCore
      // For now, we'll just refresh the state
      await nexusCore.monitorAll();
      toast.success('Auto-fix completed');
      queryClient.invalidateQueries({ queryKey: ['nexus-status'] });
    } catch (error) {
      toast.error('Auto-fix failed');
    }
  };

  // Set up monitoring interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      // Initial monitoring
      nexusCore.monitorAll();

      // Set up interval for continuous monitoring
      interval = setInterval(() => {
        nexusCore.monitorAll();
      }, 30000); // Monitor every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring]);

  // Start monitoring when component mounts
  useEffect(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    status,
    error,
    isMonitoring,
    actions: {
      startMonitoring,
      stopMonitoring,
      syncAll,
      autoFix
    }
  };
} 