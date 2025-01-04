export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'business' | 'personal';
  status: ExpenseStatus;
  memo?: string;
  receiptUrl?: string;
  lastReportDate?: string;
  submitted?: boolean;
  needsReceipt?: boolean;
  reportSubmitted?: boolean;
  tellerTransactionId?: string;
  merchantName?: string;
  tags?: string[];
}

export type ExpenseStatus = 'pending' | 'matched' | 'unmatched';

export interface ExpenseReport {
  id: string;
  date: string;
  type: 'business' | 'personal';
  expenseIds: string[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'business' | 'personal' | 'both';
  description?: string;
  color?: string;
  icon?: string;
  budgetLimit?: number;
  parentId?: string;
} 