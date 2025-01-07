import { useContext } from 'react';
import { ReceiptsContext } from '@/app/providers/ReceiptsProvider';

export function useReceipts() {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
} 