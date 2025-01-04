import { openai, RECEIPT_ANALYSIS_PROMPT } from './config';

export interface ReceiptItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface ReceiptAnalysis {
  merchant: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  category?: string;
  notes?: string;
  confidence: number;
}

export async function analyzeReceipt(
  mindeeData: any,
  imageUrl: string
): Promise<ReceiptAnalysis> {
  // First, format the Mindee OCR data
  const baseAnalysis = {
    merchant: mindeeData.merchant_name?.value || '',
    date: mindeeData.date?.value || '',
    items: mindeeData.line_items?.map((item: any) => ({
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      amount: item.total_amount || 0
    })) || [],
    subtotal: mindeeData.subtotal?.value || 0,
    tax: mindeeData.tax?.value || 0,
    total: mindeeData.total?.value || 0,
    paymentMethod: mindeeData.payment_method || '',
    confidence: mindeeData.confidence || 0
  };

  // Use GPT-4 to enhance the analysis
  const prompt = `${RECEIPT_ANALYSIS_PROMPT}\n\nAnalyze this receipt data:\n${JSON.stringify(baseAnalysis, null, 2)}\nReceipt Image URL: ${imageUrl}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      { role: 'system', content: prompt },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: 'Please analyze this receipt and provide enhanced details.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  try {
    const enhancedData = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      ...baseAnalysis,
      ...enhancedData,
      items: enhancedData.items || baseAnalysis.items,
      confidence: Math.max(baseAnalysis.confidence, enhancedData.confidence || 0)
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return baseAnalysis;
  }
}

export async function matchReceiptToExpense(
  receipt: ReceiptAnalysis,
  expenseAmount: number,
  expenseDate: string
): Promise<{
  isMatch: boolean;
  confidence: number;
  discrepancies?: {
    amount?: number;
    date?: number; // difference in days
    notes?: string;
  };
}> {
  const prompt = `Analyze if this receipt matches the expense:
Receipt: ${JSON.stringify(receipt, null, 2)}
Expense Amount: ${expenseAmount}
Expense Date: ${expenseDate}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: RECEIPT_ANALYSIS_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      isMatch: false,
      confidence: 0
    };
  }
}

export async function validateReceiptIntegrity(
  receipt: ReceiptAnalysis
): Promise<{
  isValid: boolean;
  confidence: number;
  issues?: string[];
  suggestions?: string[];
}> {
  const prompt = `Validate the integrity of this receipt:\n${JSON.stringify(receipt, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: RECEIPT_ANALYSIS_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      isValid: false,
      confidence: 0,
      issues: ['Failed to validate receipt']
    };
  }
} 