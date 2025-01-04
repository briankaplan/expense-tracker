export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  status?: 'unmatched' | 'pending' | 'matched';
  type: 'business' | 'personal';
  memo?: string;
  receiptUrl?: string;
  source?: 'manual' | 'bank' | 'receipt';
  bankTransactionId?: string;
  bankAccountId?: string;
  bankInstitution?: string;
  pending?: boolean;
  createdAt: string;
  updatedAt: string;
} 