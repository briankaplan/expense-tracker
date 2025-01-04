export interface FixResult {
  fixed: boolean;
  action: string;
  details: string;
}

export interface BackupConfig {
  directory: string;
  maxAttempts: number;
  retentionDays: number;
}

export interface OrphanedRecord {
  id: string;
  table: string;
  created_at: string;
  references: {
    table: string;
    column: string;
    value: string;
  }[];
}

export type FixType = 
  | 'database-sync'
  | 'receipt-matching'
  | 'email-integration'
  | 'backup-system'
  | 'orphaned-records'
  | 'file-structure';

export interface FixAttempt {
  type: FixType;
  timestamp: string;
  success: boolean;
  error?: string;
  details: string;
} 