import OpenAI from 'openai';
import { toast } from '@/components/ui/use-toast';

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key is not set. AI analysis features will be disabled.');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      toast({
        variant: "destructive",
        title: "AI Analysis Disabled",
        description: "Could not initialize OpenAI client. Some features will be limited."
      });
    }
  }

  private ensureClient() {
    if (!this.client) {
      throw new Error('OpenAI client is not initialized. Please check your API key.');
    }
  }

  async analyzeReceipt(receiptText: string, extractedData: any) {
    try {
      this.ensureClient();
      const response = await this.client!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a financial analyst specializing in receipt and subscription analysis. 
            Your task is to analyze receipt data and identify:
            1. Subscription details (recurring payments, trial periods, etc.)
            2. Subscription source (Apple, Google Play, direct website, etc.)
            3. Subscription status (active, trial, cancelled)
            4. Important dates (trial end, next billing, cancellation)
            5. Related subscriptions (e.g., multiple streaming services)
            6. Special conditions or promotions
            7. Cancellation terms if mentioned`
          },
          {
            role: "user",
            content: `Analyze this receipt/email content and the extracted data. Provide insights about subscriptions, trials, and payment patterns.
            
            Receipt Text:
            ${receiptText}
            
            Extracted Data:
            ${JSON.stringify(extractedData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return {
        analysis: response.choices[0].message.content,
        confidence: response.choices[0].finish_reason === 'stop' ? 'high' : 'medium'
      };
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the receipt content."
      });
      return null;
    }
  }

  async analyzeSubscriptionPattern(receipts: any[]) {
    try {
      this.ensureClient();
      const response = await this.client!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a financial analyst specializing in subscription pattern analysis.
            Your task is to analyze multiple receipts and identify patterns in subscription services:
            1. Active subscriptions and their renewal patterns
            2. Potential duplicate subscriptions
            3. Trial periods and their conversion to paid subscriptions
            4. Cancelled subscriptions and their timing
            5. Total subscription costs per service category
            6. Recommendations for optimization
            7. Unusual patterns or potential issues`
          },
          {
            role: "user",
            content: `Analyze these receipts and identify subscription patterns and insights.
            
            Receipts:
            ${JSON.stringify(receipts, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return {
        analysis: response.choices[0].message.content,
        confidence: response.choices[0].finish_reason === 'stop' ? 'high' : 'medium'
      };
    } catch (error) {
      console.error('OpenAI subscription analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze subscription patterns."
      });
      return null;
    }
  }

  async detectSubscriptionChanges(oldData: any, newData: any) {
    try {
      this.ensureClient();
      const response = await this.client!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a financial analyst specializing in subscription change detection.
            Your task is to analyze changes between two sets of subscription data and identify:
            1. New subscriptions started
            2. Subscriptions cancelled
            3. Price changes
            4. Plan changes
            5. Trial conversions
            6. Renewal pattern changes
            7. Important upcoming dates or deadlines`
          },
          {
            role: "user",
            content: `Compare these two sets of subscription data and identify significant changes.
            
            Previous Data:
            ${JSON.stringify(oldData, null, 2)}
            
            New Data:
            ${JSON.stringify(newData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return {
        analysis: response.choices[0].message.content,
        confidence: response.choices[0].finish_reason === 'stop' ? 'high' : 'medium'
      };
    } catch (error) {
      console.error('OpenAI change detection failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze subscription changes."
      });
      return null;
    }
  }
}

export const openaiService = new OpenAIService(); 