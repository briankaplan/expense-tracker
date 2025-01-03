export type Status = 'pending' | 'matched' | 'unmatched';
export type ExpenseType = 'business' | 'personal';

export interface BaseEntity {
  id: string;
  dateCreated: string;
  dateUpdated?: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
} 