export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'income';
  status: 'completed' | 'pending' | 'failed';
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  renewalDate: string;
  status: 'active' | 'warning' | 'cancelled';
  provider: string;
}

export interface SpendingTrend {
  date: string;
  amount: number;
  category?: string;
}

export interface NexusEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface NexusSubscriber {
  (data: any): void;
}

export interface NexusMonitorOptions {
  interval?: number;
  batchSize?: number;
  retryAttempts?: number;
} 