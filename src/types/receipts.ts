export interface Receipt {
  id: string;
  url: string;
  date: string;
  merchant?: string;
  total?: number;
  status: 'pending' | 'matched' | 'unmatched';
  expenseId?: string;
  createdAt: string;
  updatedAt: string;
} 