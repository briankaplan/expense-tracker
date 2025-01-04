import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

interface NexusState {
  teller: {
    status: 'active' | 'inactive';
    pendingTransactions: number;
    lastSync: string;
  };
  receipts: {
    pending: number;
    needsMatching: number;
  };
  ocr: {
    processing: number;
  };
  gmail: {
    connected: boolean;
    unprocessedEmails: number;
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

export class NexusCore extends EventEmitter {
  private supabase: SupabaseClient;
  private state: NexusState;

  constructor() {
    super();
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize state
    this.state = {
      teller: {
        status: 'inactive',
        pendingTransactions: 0,
        lastSync: new Date().toISOString()
      },
      receipts: {
        pending: 0,
        needsMatching: 0
      },
      ocr: {
        processing: 0
      },
      gmail: {
        connected: false,
        unprocessedEmails: 0
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
  }

  public getState(): NexusState {
    return this.state;
  }

  public async monitorAll(): Promise<void> {
    try {
      await Promise.all([
        this.monitorExpenses(),
        this.monitorReceipts(),
        this.monitorEmail(),
        this.monitorBackups(),
        this.monitorReports()
      ]);

      this.emit('state-updated', this.state);
    } catch (error) {
      console.error('Error in monitorAll:', error);
      this.emit('error', error);
    }
  }

  private async monitorExpenses(): Promise<void> {
    try {
      const { data: transactions } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending');

      this.state.teller.pendingTransactions = transactions?.length || 0;
      this.state.teller.lastSync = new Date().toISOString();
      this.state.teller.status = 'active';
    } catch (error) {
      console.error('Error monitoring expenses:', error);
      this.state.teller.status = 'inactive';
    }
  }

  private async monitorReceipts(): Promise<void> {
    try {
      const { data: receipts } = await this.supabase
        .from('receipts')
        .select('*')
        .eq('status', 'pending');

      this.state.receipts.pending = receipts?.length || 0;

      const { data: unmatched } = await this.supabase
        .from('receipts')
        .select('*')
        .eq('status', 'unmatched');

      this.state.receipts.needsMatching = unmatched?.length || 0;
    } catch (error) {
      console.error('Error monitoring receipts:', error);
    }
  }

  private async monitorEmail(): Promise<void> {
    try {
      const { data: settings } = await this.supabase
        .from('settings')
        .select('*')
        .eq('key', 'gmail_connection')
        .single();

      this.state.gmail.connected = settings?.value?.connected || false;

      const { data: emails } = await this.supabase
        .from('emails')
        .select('*')
        .eq('status', 'unprocessed');

      this.state.gmail.unprocessedEmails = emails?.length || 0;
    } catch (error) {
      console.error('Error monitoring email:', error);
    }
  }

  private async monitorBackups(): Promise<void> {
    try {
      const { data: backups } = await this.supabase
        .from('backups')
        .select('*')
        .eq('status', 'pending');

      this.state.dropbox.pendingBackups = backups?.length || 0;
      
      const { data: lastBackup } = await this.supabase
        .from('backups')
        .select('created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastBackup) {
        this.state.dropbox.lastBackup = lastBackup.created_at;
      }
    } catch (error) {
      console.error('Error monitoring backups:', error);
    }
  }

  private async monitorReports(): Promise<void> {
    try {
      const { data: reports } = await this.supabase
        .from('reports')
        .select('*')
        .eq('status', 'open');

      this.state.reports.open = reports?.length || 0;

      const { data: pendingReceipts } = await this.supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending_receipts');

      this.state.reports.pendingReceipts = pendingReceipts?.length || 0;
    } catch (error) {
      console.error('Error monitoring reports:', error);
    }
  }
} 