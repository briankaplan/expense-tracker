export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: {
    name: string;
  };
  type: 'personal' | 'business';
  status: 'pending' | 'posted';
} 