import { type Expense } from './expenses';

export type ReportType = 'business' | 'personal';
export type ReportStatus = 'open' | 'closed';
export type SortField = 'date' | 'amount' | 'category' | 'merchant';
export type SortDirection = 'asc' | 'desc';

export interface ReportExpense extends Expense {
  merchant: string;
  matchedReceiptId?: string;
  needsReview?: boolean;
  comment?: string;
}

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  totalAmount: number;
  expenseCount: number;
  missingReceipts: number;
  missingComments: number;
  dateCreated: string;
  dateClosed?: string;
  expenses: ReportExpense[];
  categories: { [key: string]: number };
  merchants: { [key: string]: number };
}

export interface ReportFilters {
  search?: string;
  categories?: string[];
  merchants?: string[];
  hasReceipt?: boolean;
  hasComment?: boolean;
  needsReview?: boolean;
}

export interface ReportSort {
  field: SortField;
  direction: SortDirection;
}

export interface ReceiptMatch {
  expenseId: string;
  receiptId: string;
  confidence: number;
  amountDiff?: number;
} 