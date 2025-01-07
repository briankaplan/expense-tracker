export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  merchant?: string;
  type?: 'business' | 'personal';
  status?: 'pending' | 'matched';
  receipt_id?: string;
  details?: Record<string, any>;
  createdAt: string;
} 