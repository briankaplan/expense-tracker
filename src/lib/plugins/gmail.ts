import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { extractReceiptData } from '@/lib/services/receipt-parser';

interface GmailMessage {
  id: string;
  from: string;
  date: string;
  subject: string;
}

interface Receipt {
  id: string;
  from: string;
  date: string;
  subject: string;
  receiptUrl?: string;
}

interface GmailScanResult {
  receipts: Receipt[];
  errors: string[];
}

export class GmailPlugin {
  private auth: OAuth2Client;

  constructor(credentials: any) {
    this.auth = new OAuth2Client({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri: credentials.redirectUri,
    });
    this.auth.setCredentials(credentials.tokens);
  }

  async scanEmails(query = 'receipt OR invoice'): Promise<GmailScanResult> {
    const gmail = google.gmail({ version: 'v1', auth: this.auth });
    const results: GmailScanResult = {
      receipts: [],
      errors: [],
    };

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100,
      });

      const messages = response.data.messages || [];

      for (const message of messages) {
        try {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
          });

          const headers = details.data.payload?.headers || [];
          const from = headers.find(h => h.name === 'From')?.value || '';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          const subject = headers.find(h => h.name === 'Subject')?.value || '';

          const receipt = await this.processMessage({
            id: message.id!,
            from,
            date,
            subject,
          });

          if (receipt) {
            results.receipts.push(receipt);
          }
        } catch (error) {
          if (error instanceof Error) {
            results.errors.push(`Failed to process message: ${error.message}`);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        results.errors.push(`Failed to scan emails: ${error.message}`);
      }
    }

    return results;
  }

  private async processMessage(message: GmailMessage): Promise<Receipt | null> {
    try {
      const receipt = await extractReceiptData(message);
      if (receipt) {
        return {
          id: message.id,
          from: message.from,
          date: message.date,
          subject: message.subject,
          receiptUrl: receipt.receiptUrl,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to process receipt: ${error.message}`);
      }
    }
    return null;
  }
} 