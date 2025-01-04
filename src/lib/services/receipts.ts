import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { OpenAI } from '@/lib/services/openai';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptPrediction {
  inference: {
    prediction: {
      line_items: LineItem[];
      total: number;
      date: string;
      vendor: string;
    };
  };
}

export async function uploadAndParseReceipt(file: File) {
  const supabase = createClientComponentClient();
  const openai = new OpenAI();

  try {
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`${Date.now()}-${file.name}`, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(uploadData.path);

    // Send to OpenAI for analysis
    const prediction = await openai.analyzeReceipt(publicUrl) as ReceiptPrediction;

    // Extract line items and totals
    const items = prediction.inference.prediction.line_items.map((item: LineItem) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    }));

    return {
      receiptUrl: publicUrl,
      items,
      total: prediction.inference.prediction.total,
      date: prediction.inference.prediction.date,
      vendor: prediction.inference.prediction.vendor,
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
} 