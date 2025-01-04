import type { Expense } from '@/types';
import { OpenAI } from '@/lib/services/openai';
import { EXPENSE_SYSTEM_PROMPT } from './prompts';

const openai = new OpenAI();

export interface ExpenseAnalysis {
  type: 'business' | 'personal';
  category: string;
  confidence: number;
  taxDeductible: boolean;
  notes?: string;
}

export async function analyzeExpense(expense: Expense): Promise<ExpenseAnalysis> {
  const prompt = `${EXPENSE_SYSTEM_PROMPT}\n\nAnalyze the following expense:\n${JSON.stringify(expense, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Please analyze this expense and provide a categorization.' }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      type: result.type || 'personal',
      category: result.category || 'Uncategorized',
      confidence: result.confidence || 0.5,
      taxDeductible: result.taxDeductible || false,
      notes: result.notes
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      type: 'personal',
      category: 'Uncategorized',
      confidence: 0,
      taxDeductible: false
    };
  }
}

export async function detectSubscription(expenses: Expense[]): Promise<{
  isSubscription: boolean;
  frequency?: 'monthly' | 'yearly';
  nextBillingDate?: string;
  confidence: number;
}> {
  const prompt = `Analyze these expenses to determine if they represent a subscription:\n${JSON.stringify(expenses, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: EXPENSE_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return { isSubscription: false, confidence: 0 };
  }
}

export async function suggestExpenseOptimizations(expenses: Expense[]): Promise<{
  suggestions: string[];
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}> {
  const prompt = `Analyze these expenses and suggest optimizations:\n${JSON.stringify(expenses, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: EXPENSE_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      suggestions: [],
      potentialSavings: 0,
      priority: 'low'
    };
  }
} 