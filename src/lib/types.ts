export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: 'personal' | 'business';
  status: 'pending' | 'matched' | 'missing';
  comment?: string;
  receiptUrl?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  nextBilling: string;
  category: string;
  type: 'personal' | 'business';
  status: 'active' | 'canceled';
} 