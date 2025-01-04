import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

export const EXPENSE_SYSTEM_PROMPT = `You are an AI assistant helping to analyze and categorize expenses. 
Consider the following when analyzing expenses:

1. Business vs Personal classification
2. Category assignment based on merchant and description
3. Receipt validation and matching
4. Subscription detection and management
5. Expense report organization
6. Tax implications and deductions`;

export const RECEIPT_ANALYSIS_PROMPT = `Analyze the following receipt and extract key information:

1. Merchant name and details
2. Date and time
3. Individual line items
4. Subtotal, tax, and total amounts
5. Payment method if available
6. Any special notes or conditions`;

export const REPORT_GENERATION_PROMPT = `Generate an expense report summary with the following details:

1. Total expenses by category
2. Business vs Personal breakdown
3. Missing receipts and documentation
4. Potential tax deductions
5. Unusual spending patterns
6. Recommendations for expense management`; 