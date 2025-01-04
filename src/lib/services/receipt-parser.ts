import { OpenAI } from './openai';

interface ReceiptData {
  date: string;
  total: number;
  merchant: string;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  tax?: number;
  tip?: number;
}

export async function extractReceiptData(imageText: string): Promise<ReceiptData> {
  const openai = new OpenAI();
  
  const prompt = `
    Please analyze the following receipt text and extract the following information in JSON format:
    - date
    - total amount
    - merchant name
    - list of items with their prices and quantities
    - tax amount (if present)
    - tip amount (if present)

    Receipt text:
    ${imageText}
  `;

  try {
    const response = await openai.generateCompletion(prompt);
    const parsedData = JSON.parse(response);
    
    return {
      date: parsedData.date,
      total: parsedData.total,
      merchant: parsedData.merchant,
      items: parsedData.items || [],
      tax: parsedData.tax,
      tip: parsedData.tip,
    };
  } catch (error) {
    console.error('Failed to parse receipt:', error);
    throw new Error('Failed to parse receipt data');
  }
} 