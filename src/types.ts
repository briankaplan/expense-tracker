export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'business' | 'personal';
  category?: string;
  receiptUrl?: string;
  receiptTotal?: number;
  receiptMerchant?: string;
  receiptItems?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  source?: 'manual' | 'bank';
  bankTransactionId?: string;
  bankAccountId?: string;
  bankInstitution?: string;
  pending?: boolean;
}

export interface ReceiptItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface Receipt {
  id: string;
  expenseId: string;
  userId: string;
  total: number;
  date: string;
  merchant: string;
  category?: string;
  items?: ReceiptItem[];
  taxAmount?: number;
  receiptUrl: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseOverride {
  id: string;
  userId: string;
  bankTransactionId: string;
  type?: 'business' | 'personal';
  category?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
} 