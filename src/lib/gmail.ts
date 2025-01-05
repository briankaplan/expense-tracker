import { toast } from "@/components/ui/use-toast";
import { openaiService } from "./openai";

interface SubscriptionInfo {
  service: string;
  status: 'active' | 'trial' | 'cancelled';
  source: string;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  nextBillingDate?: string;
  amount: number;
  currency: string;
  plan?: string;
  category?: string;
  relatedSubscriptions?: string[];
}

interface ReceiptAnalysis {
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  subscription?: SubscriptionInfo;
  rawText: string;
  mindeeData: any;
  openaiAnalysis: {
    analysis: string;
    confidence: string;
  } | null;
}

class GmailService {
  private isConnected = false;
  private subscriptionData: SubscriptionInfo[] = [];

  async authenticate() {
    // Mock authentication for now
    this.isConnected = true;
    localStorage.setItem('gmail_credentials', 'mock_credentials');
    toast({
      title: "Connected to Gmail",
      description: "Successfully connected to your Gmail account."
    });
  }

  async scanEmails(daysBack: number = 30): Promise<ReceiptAnalysis[]> {
    if (!this.isConnected) {
      throw new Error('Not authenticated with Gmail');
    }

    toast({
      title: "Scanning Emails",
      description: `Looking for receipts and subscriptions in the last ${daysBack} days...`
    });

    // Mock data for demonstration
    const mockReceipts: ReceiptAnalysis[] = [
      {
        merchant: "Netflix",
        date: "2024-01-01",
        amount: 15.99,
        currency: "USD",
        rawText: "Your Netflix subscription has been renewed. Next billing date: Feb 1, 2024",
        mindeeData: {
          // Mindee extracted data would go here
        },
        subscription: {
          service: "Netflix",
          status: "active",
          source: "direct",
          startDate: "2023-01-01",
          nextBillingDate: "2024-02-01",
          amount: 15.99,
          currency: "USD",
          category: "streaming"
        },
        openaiAnalysis: null // Will be populated by analyzeReceipts
      },
      {
        merchant: "Apple",
        date: "2024-01-02",
        amount: 9.99,
        currency: "USD",
        rawText: "Your subscription to Apple TV+ has started. Free trial ends on Feb 2, 2024",
        mindeeData: {
          // Mindee extracted data would go here
        },
        subscription: {
          service: "Apple TV+",
          status: "trial",
          source: "apple",
          startDate: "2024-01-02",
          trialEndDate: "2024-02-02",
          amount: 9.99,
          currency: "USD",
          category: "streaming"
        },
        openaiAnalysis: null
      }
    ];

    // Analyze each receipt with OpenAI
    const analyzedReceipts = await Promise.all(
      mockReceipts.map(async (receipt) => {
        const analysis = await openaiService.analyzeReceipt(
          receipt.rawText,
          {
            merchant: receipt.merchant,
            date: receipt.date,
            amount: receipt.amount,
            mindeeData: receipt.mindeeData,
            subscription: receipt.subscription
          }
        );
        return { ...receipt, openaiAnalysis: analysis };
      })
    );

    // Analyze subscription patterns
    const patternAnalysis = await openaiService.analyzeSubscriptionPattern(analyzedReceipts);
    if (patternAnalysis) {
      toast({
        title: "Subscription Analysis Complete",
        description: "Found patterns in your subscriptions. Check the details below."
      });
    }

    // Update subscription data and check for changes
    const oldSubscriptions = this.subscriptionData;
    this.subscriptionData = analyzedReceipts
      .filter(receipt => receipt.subscription)
      .map(receipt => receipt.subscription!);

    const changes = await openaiService.detectSubscriptionChanges(
      oldSubscriptions,
      this.subscriptionData
    );

    if (changes) {
      toast({
        title: "Subscription Changes Detected",
        description: "Your subscription status has been updated."
      });
    }

    return analyzedReceipts;
  }

  disconnect() {
    this.isConnected = false;
    localStorage.removeItem('gmail_credentials');
    toast({
      title: "Disconnected from Gmail",
      description: "Successfully disconnected your Gmail account."
    });
  }

  getSubscriptionSummary(): {
    active: SubscriptionInfo[];
    trial: SubscriptionInfo[];
    cancelled: SubscriptionInfo[];
    totalMonthly: number;
  } {
    const summary = {
      active: this.subscriptionData.filter(sub => sub.status === 'active'),
      trial: this.subscriptionData.filter(sub => sub.status === 'trial'),
      cancelled: this.subscriptionData.filter(sub => sub.status === 'cancelled'),
      totalMonthly: this.subscriptionData
        .filter(sub => sub.status === 'active')
        .reduce((total, sub) => total + sub.amount, 0)
    };

    return summary;
  }
}

export const gmailService = new GmailService(); 