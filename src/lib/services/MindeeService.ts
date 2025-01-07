interface OCRResult {
  width: number;
  height: number;
  text: string;
  confidence: number;
  merchant?: string;
  amount?: number;
  date?: string;
}

export class MindeeService {
  static async processReceipt(file: File): Promise<OCRResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/mindee/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process receipt');
      }

      const result = await response.json();

      return {
        width: 0, // These will come from image processing
        height: 0,
        text: '', // This would come from OCR text extraction
        confidence: result.merchant?.confidence || 0,
        merchant: result.merchant?.name,
        amount: result.amount?.value,
        date: result.date?.value,
      };
    } catch (error) {
      console.error('Error processing receipt:', error);
      return {
        width: 0,
        height: 0,
        text: '',
        confidence: 0,
        merchant: undefined,
        amount: undefined,
        date: undefined,
      };
    }
  }
} 