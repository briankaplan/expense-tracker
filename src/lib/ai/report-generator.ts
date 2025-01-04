import type { Expense } from '@/types';
import { OpenAI } from '@/lib/services/openai';
import { REPORT_GENERATION_PROMPT } from './config';

export interface ReportSummary {
  totalAmount: number;
  businessTotal: number;
  personalTotal: number;
  categories: {
    [key: string]: {
      total: number;
      count: number;
      items: Expense[];
    };
  };
  missingReceipts: number;
  taxDeductible: number;
  insights: string[];
  recommendations: string[];
}

export interface ReportAnalysis {
  summary: ReportSummary;
  trends: {
    description: string;
    change: number;
    significance: 'high' | 'medium' | 'low';
  }[];
  anomalies: {
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation?: string;
  }[];
  taxImplications: {
    potentialDeductions: number;
    notes: string[];
  };
}

export async function generateReport(
  expenses: Expense[],
  dateRange: { from: string; to: string }
): Promise<ReportAnalysis> {
  const prompt = `${REPORT_GENERATION_PROMPT}\n\nAnalyze these expenses for the period ${dateRange.from} to ${dateRange.to}:\n${JSON.stringify(expenses, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Please generate a comprehensive report analysis.' }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      summary: {
        totalAmount: 0,
        businessTotal: 0,
        personalTotal: 0,
        categories: {},
        missingReceipts: 0,
        taxDeductible: 0,
        insights: [],
        recommendations: []
      },
      trends: [],
      anomalies: [],
      taxImplications: {
        potentialDeductions: 0,
        notes: []
      }
    };
  }
}

export async function analyzeSpendingPatterns(
  expenses: Expense[],
  timeframe: 'weekly' | 'monthly' | 'yearly'
): Promise<{
  patterns: {
    description: string;
    frequency: string;
    amount: number;
    category?: string;
  }[];
  insights: string[];
  suggestions: string[];
}> {
  const prompt = `Analyze spending patterns in these expenses:\n${JSON.stringify(expenses, null, 2)}\nTimeframe: ${timeframe}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: REPORT_GENERATION_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      patterns: [],
      insights: [],
      suggestions: []
    };
  }
}

export async function generateTaxReport(
  expenses: Expense[]
): Promise<{
  deductions: {
    category: string;
    amount: number;
    confidence: number;
    notes?: string;
  }[];
  totalDeductions: number;
  recommendations: string[];
  warnings: string[];
}> {
  const prompt = `Generate a tax report for these expenses:\n${JSON.stringify(expenses, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: REPORT_GENERATION_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1500
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      deductions: [],
      totalDeductions: 0,
      recommendations: [],
      warnings: ['Failed to generate tax report']
    };
  }
} 