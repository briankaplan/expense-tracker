export interface Receipt {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
  expenseId?: string;
  status: 'pending' | 'matched' | 'unmatched';
  metadata?: {
    width?: number;
    height?: number;
    ocr?: {
      text: string;
      confidence: number;
    };
    merchant?: {
      name: string;
      confidence: number;
    };
    amount?: {
      value: number;
      confidence: number;
    };
    date?: {
      value: string;
      confidence: number;
    };
  };
} 