import OpenAI from 'openai';
import { type Subscription } from '@/types/subscriptions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DetectedSubscription {
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'trial';
  category: string;
  provider: string;
  nextBillingDate?: string;
  description?: string;
  alternativeServices?: Array<{
    name: string;
    price: number;
    features: string[];
    savings: number;
  }>;
  optimizationSuggestions?: Array<{
    type: 'cancel' | 'downgrade' | 'switch' | 'combine';
    description: string;
    potentialSavings: number;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface SubscriptionAnalysis {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  categorizedSpending: Record<string, number>;
  unusedSubscriptions: string[];
  overlapingServices: Array<{
    services: string[];
    description: string;
    potentialSavings: number;
  }>;
  recommendations: Array<{
    type: 'action';
    description: string;
    impact: 'high' | 'medium' | 'low';
    potentialSavings: number;
  }>;
}

export async function detectSubscriptionsFromEmails(emails: string[]): Promise<DetectedSubscription[]> {
  try {
    const prompt = `Analyze these emails and identify any subscriptions or recurring payments. For each subscription, extract:
    - Service name
    - Amount
    - Billing cycle (monthly/yearly/trial)
    - Category
    - Provider/payment method
    - Next billing date (if available)
    - Description

    Emails:
    ${emails.join('\n\n')}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    // Parse the response and convert it to DetectedSubscription objects
    // This is a simplified implementation - you would need to parse the actual response format
    return [];
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return [];
  }
}

export async function detectSubscriptionsFromReceipts(receiptTexts: string[]): Promise<DetectedSubscription[]> {
  try {
    const prompt = `Analyze these receipt texts and identify any subscriptions or recurring payments. For each subscription, extract:
    - Service name
    - Amount
    - Billing cycle (monthly/yearly/trial)
    - Category
    - Provider/payment method
    - Next billing date (if available)
    - Description

    Receipts:
    ${receiptTexts.join('\n\n')}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    // Parse the response and convert it to DetectedSubscription objects
    // This is a simplified implementation - you would need to parse the actual response format
    return [];
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return [];
  }
}

export async function detectSubscriptionsFromAppleReceipts(): Promise<DetectedSubscription[]> {
  // TODO: Implement Apple App Store receipt verification and subscription detection
  return [];
}

export async function detectSubscriptionsFromGooglePlay(): Promise<DetectedSubscription[]> {
  // TODO: Implement Google Play subscription detection
  return [];
}

export async function analyzeSubscriptionPattern(transactions: any[]): Promise<DetectedSubscription[]> {
  try {
    const prompt = `Analyze these transactions and identify potential subscription patterns. Look for:
    - Regular recurring payments of the same amount
    - Common subscription services
    - Typical subscription amounts
    - Payment patterns that suggest trial periods or annual renewals

    Transactions:
    ${JSON.stringify(transactions, null, 2)}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    // Parse the response and convert it to DetectedSubscription objects
    // This is a simplified implementation - you would need to parse the actual response format
    return [];
  } catch (error) {
    console.error('Error analyzing subscription patterns:', error);
    return [];
  }
}

export async function analyzeSubscriptionOptimizations(
  subscriptions: Subscription[]
): Promise<SubscriptionAnalysis> {
  try {
    const prompt = `Analyze these subscriptions and provide detailed optimization recommendations:
    - Identify unused or underutilized subscriptions
    - Find overlapping services
    - Suggest potential downgrades or plan changes
    - Calculate potential savings
    - Identify better alternatives
    - Look for bundle opportunities

    Subscriptions:
    ${JSON.stringify(subscriptions, null, 2)}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response) as SubscriptionAnalysis;
  } catch (error) {
    console.error('Error analyzing subscription optimizations:', error);
    return {
      totalMonthlySpend: 0,
      totalYearlySpend: 0,
      categorizedSpending: {},
      unusedSubscriptions: [],
      overlapingServices: [],
      recommendations: [],
    };
  }
}

export async function findAlternativeServices(
  subscription: Subscription
): Promise<DetectedSubscription['alternativeServices']> {
  try {
    const prompt = `Find alternative services for this subscription:
    ${JSON.stringify(subscription, null, 2)}

    Consider:
    - Similar services with better pricing
    - Services with more features at similar price
    - Free alternatives if available
    - Bundle opportunities with other services
    
    Format the response as a JSON array of alternatives with name, price, features, and potential savings.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error finding alternative services:', error);
    return [];
  }
}

export async function detectSubscriptionRenewalRisks(
  subscriptions: Subscription[]
): Promise<Array<{
  subscriptionId: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
  deadline?: string;
}>> {
  try {
    const prompt = `Analyze these subscriptions for renewal risks:
    - Identify trial periods ending soon
    - Find annual renewals coming up
    - Detect price increases
    - Look for better timing to cancel/switch
    - Check for seasonal usage patterns

    Subscriptions:
    ${JSON.stringify(subscriptions, null, 2)}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error detecting renewal risks:', error);
    return [];
  }
} 