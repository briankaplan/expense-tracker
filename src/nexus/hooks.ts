import { useEffect, useRef } from 'react';
import { NexusMonitor } from './monitor';
import { NexusAnalytics } from './analytics';

export function useNexusMonitor(channel: string) {
  const monitorRef = useRef<NexusMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new NexusMonitor(channel);
    }
    return () => {
      monitorRef.current?.disconnect();
    };
  }, [channel]);

  return monitorRef.current!;
}

export function useNexusAnalytics(channel: string) {
  const analyticsRef = useRef<NexusAnalytics | null>(null);

  useEffect(() => {
    if (!analyticsRef.current) {
      analyticsRef.current = new NexusAnalytics(channel);
    }
    return () => {
      analyticsRef.current?.disconnect();
    };
  }, [channel]);

  return analyticsRef.current!;
} 