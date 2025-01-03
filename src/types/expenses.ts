export interface Expense {
  id: string;
  accountId: string;
  accountName: string;
  accountType: string;
  accountLastFour: string;
  institution: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: 'pending' | 'completed';
  merchant: string;
  type?: 'business' | 'personal' | 'manual';
  createdAt: string;
  memo?: string;
  receiptUrl?: string;
  details?: {
    isCredit: boolean;
    originalAmount: number;
    processingStatus?: string;
    counterpartyType?: string;
  };
} 