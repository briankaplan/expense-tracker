import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface NexusState {
  teller: {
    lastSync: string;
    status: 'active' | 'error' | 'disconnected';
    pendingTransactions: number;
  };
  receipts: {
    pending: number;
    needsMatching: number;
    lastProcessed: string;
  };
  gmail: {
    connected: boolean;
    lastSync: string;
    unprocessedEmails: number;
  };
  sms: {
    active: boolean;
    pendingReceipts: number;
  };
  ocr: {
    queue: number;
    processing: number;
    errors: number;
  };
  dropbox: {
    lastBackup: string;
    pendingBackups: number;
  };
  reports: {
    open: number;
    pendingReceipts: number;
  };
}

export class NexusCore {
  private supabase;
  private state: NexusState;
  private readonly STATE_FILE = '.nexus/state.json';
  private readonly BACKUP_DIR = '.nexus/backups';

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    this.initializeState();
  }

  private async initializeState() {
    try {
      // Create .nexus directory if it doesn't exist
      await fs.mkdir('.nexus', { recursive: true });
      await fs.mkdir(this.BACKUP_DIR, { recursive: true });

      // Load or create state
      if (existsSync(this.STATE_FILE)) {
        const stateData = await fs.readFile(this.STATE_FILE, 'utf8');
        this.state = JSON.parse(stateData);
      } else {
        this.state = {
          teller: {
            lastSync: new Date().toISOString(),
            status: 'disconnected',
            pendingTransactions: 0
          },
          receipts: {
            pending: 0,
            needsMatching: 0,
            lastProcessed: new Date().toISOString()
          },
          gmail: {
            connected: false,
            lastSync: new Date().toISOString(),
            unprocessedEmails: 0
          },
          sms: {
            active: false,
            pendingReceipts: 0
          },
          ocr: {
            queue: 0,
            processing: 0,
            errors: 0
          },
          dropbox: {
            lastBackup: new Date().toISOString(),
            pendingBackups: 0
          },
          reports: {
            open: 0,
            pendingReceipts: 0
          }
        };
        await this.saveState();
      }
    } catch (error) {
      console.error(chalk.red('Failed to initialize Nexus state:', error));
      process.exit(1);
    }
  }

  private async saveState() {
    await fs.writeFile(this.STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  async monitorExpenseSync() {
    console.log(chalk.blue('\n🔄 Monitoring expense synchronization...'));

    try {
      // Check Teller connection
      const { data: connections } = await this.supabase
        .from('bank_connections')
        .select('status');

      this.state.teller.status = connections?.[0]?.status || 'disconnected';

      // Check pending transactions
      const { count: pendingCount } = await this.supabase
        .from('expenses')
        .select('count')
        .eq('status', 'pending');

      this.state.teller.pendingTransactions = pendingCount || 0;
      this.state.teller.lastSync = new Date().toISOString();

      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Error monitoring expense sync:', error));
    }
  }

  async monitorReceiptProcessing() {
    console.log(chalk.blue('\n📑 Monitoring receipt processing...'));

    try {
      // Check unmatched receipts
      const { count: unmatchedCount } = await this.supabase
        .from('receipts')
        .select('count')
        .eq('matched', false);

      this.state.receipts.needsMatching = unmatchedCount || 0;

      // Check pending OCR
      const { count: ocrCount } = await this.supabase
        .from('receipts')
        .select('count')
        .is('ocr_data', null);

      this.state.ocr.queue = ocrCount || 0;
      this.state.receipts.lastProcessed = new Date().toISOString();

      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Error monitoring receipt processing:', error));
    }
  }

  async monitorEmailSync() {
    console.log(chalk.blue('\n📧 Monitoring email synchronization...'));

    try {
      // Check unprocessed emails
      const { count } = await this.supabase
        .from('email_receipts')
        .select('count')
        .eq('processed', false);

      this.state.gmail.unprocessedEmails = count || 0;
      this.state.gmail.lastSync = new Date().toISOString();

      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Error monitoring email sync:', error));
    }
  }

  async monitorBackups() {
    console.log(chalk.blue('\n💾 Monitoring backups...'));

    try {
      // Count receipts not backed up to Dropbox
      const { count } = await this.supabase
        .from('receipts')
        .select('count')
        .is('backup_path', null);

      this.state.dropbox.pendingBackups = count || 0;
      this.state.dropbox.lastBackup = new Date().toISOString();

      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Error monitoring backups:', error));
    }
  }

  async monitorReports() {
    console.log(chalk.blue('\n📊 Monitoring reports...'));

    try {
      // Get open reports
      const { count: openCount } = await this.supabase
        .from('reports')
        .select('count')
        .eq('status', 'open');

      this.state.reports.open = openCount || 0;

      // Get missing receipts in reports
      const { data: reports } = await this.supabase
        .from('reports')
        .select('missing_receipts_count')
        .eq('status', 'open');

      this.state.reports.pendingReceipts = reports?.reduce((sum, report) => 
        sum + (report.missing_receipts_count || 0), 0) || 0;

      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Error monitoring reports:', error));
    }
  }

  async monitorAll() {
    await Promise.all([
      this.monitorExpenseSync(),
      this.monitorReceiptProcessing(),
      this.monitorEmailSync(),
      this.monitorBackups(),
      this.monitorReports()
    ]);
  }

  getState(): NexusState {
    return { ...this.state };
  }
} 