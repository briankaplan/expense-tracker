import { NexusEvent, NexusSubscriber, NexusMonitorOptions } from './types';

export class NexusMonitor {
  private channel: string;
  private subscribers: Set<NexusSubscriber>;
  private options: Required<NexusMonitorOptions>;
  private isConnected: boolean;
  private retryCount: number;
  private eventBuffer: NexusEvent[];

  constructor(channel: string, options: NexusMonitorOptions = {}) {
    this.channel = channel;
    this.subscribers = new Set();
    this.options = {
      interval: options.interval || 5000,
      batchSize: options.batchSize || 100,
      retryAttempts: options.retryAttempts || 3,
    };
    this.isConnected = false;
    this.retryCount = 0;
    this.eventBuffer = [];

    this.connect();
  }

  private async connect() {
    try {
      this.isConnected = true;
      this.startMonitoring();
    } catch (error) {
      console.error(`Failed to connect to channel ${this.channel}:`, error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.retryCount < this.options.retryAttempts) {
      this.retryCount++;
      setTimeout(() => this.connect(), this.options.interval);
    } else {
      console.error(`Max retry attempts reached for channel ${this.channel}`);
    }
  }

  private startMonitoring() {
    // Simulate real-time data updates
    setInterval(() => {
      const mockData = this.generateMockData();
      this.processEvent({
        type: this.channel,
        data: mockData,
        timestamp: Date.now(),
      });
    }, this.options.interval);
  }

  private generateMockData() {
    // Generate mock data based on the channel type
    switch (this.channel) {
      case 'transactions':
        return Array.from({ length: 5 }, (_, i) => ({
          id: `tx-${Date.now()}-${i}`,
          description: `Transaction ${i + 1}`,
          amount: Math.random() * 1000,
          date: new Date().toISOString(),
          category: ['Food', 'Transport', 'Entertainment'][Math.floor(Math.random() * 3)],
          type: Math.random() > 0.5 ? 'expense' : 'income',
          status: 'completed',
        }));
      case 'subscriptions':
        return Array.from({ length: 3 }, (_, i) => ({
          id: `sub-${Date.now()}-${i}`,
          name: `Subscription ${i + 1}`,
          amount: Math.random() * 100,
          category: ['Software', 'Entertainment', 'Services'][i],
          renewalDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: Math.random() > 0.8 ? 'warning' : 'active',
          provider: ['Netflix', 'Spotify', 'Adobe'][i],
        }));
      default:
        return [];
    }
  }

  private processEvent(event: NexusEvent) {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length >= this.options.batchSize) {
      this.flushEvents();
    }
    this.notifySubscribers(event.data);
  }

  private flushEvents() {
    // In a real implementation, this would persist events to storage
    this.eventBuffer = [];
  }

  private notifySubscribers(data: any) {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(data);
      } catch (error) {
        console.error('Error in subscriber:', error);
      }
    });
  }

  public subscribe(subscriber: NexusSubscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public disconnect() {
    this.isConnected = false;
    this.subscribers.clear();
    this.flushEvents();
  }
} 