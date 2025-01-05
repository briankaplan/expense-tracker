import { NexusSubscriber, SpendingTrend } from './types';

export class NexusAnalytics {
  private channel: string;
  private subscribers: Set<NexusSubscriber>;
  private dataPoints: SpendingTrend[];
  private updateInterval: number;

  constructor(channel: string) {
    this.channel = channel;
    this.subscribers = new Set();
    this.dataPoints = [];
    this.updateInterval = 10000; // 10 seconds

    this.startAnalytics();
  }

  private startAnalytics() {
    // Simulate analytics data updates
    setInterval(() => {
      this.generateTrendData();
      this.notifySubscribers(this.dataPoints);
    }, this.updateInterval);
  }

  private generateTrendData() {
    const now = new Date();
    const numberOfDays = 14; // Show 2 weeks of data

    this.dataPoints = Array.from({ length: numberOfDays }, (_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (numberOfDays - index - 1));

      return {
        date: date.toISOString(),
        amount: Math.random() * 1000 + 500, // Random amount between 500 and 1500
        category: index % 2 === 0 ? 'Recurring' : 'One-time',
      };
    });

    // Sort data points by date
    this.dataPoints.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private notifySubscribers(data: SpendingTrend[]) {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(data);
      } catch (error) {
        console.error('Error in analytics subscriber:', error);
      }
    });
  }

  public subscribe(subscriber: NexusSubscriber) {
    this.subscribers.add(subscriber);
    // Send initial data
    this.generateTrendData();
    subscriber(this.dataPoints);
    
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public disconnect() {
    this.subscribers.clear();
    this.dataPoints = [];
  }
} 