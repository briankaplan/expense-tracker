import { uploadAndParseReceipt } from '@/lib/services/receipts';

interface SMSReceipt {
  id: string;
  from: string;
  date: string;
  content: string;
  amount?: number;
  merchant?: string;
  receiptUrl?: string;
}

interface SMSPluginConfig {
  phoneNumbers: string[]; // List of authorized phone numbers
  shortcodes: string[]; // List of receipt service shortcodes (e.g., Square, Toast)
}

export class SMSPlugin {
  private config: SMSPluginConfig;
  private receiptPatterns: RegExp[];

  constructor(config: SMSPluginConfig) {
    this.config = config;
    this.receiptPatterns = [
      // Square receipt pattern
      /Square receipt from (.*?) for \$([\d.]+)/i,
      // Toast receipt pattern
      /Your (.*?) receipt for \$([\d.]+)/i,
      // Generic receipt pattern
      /Receipt.*?\$([\d.]+).*?from (.*?)(\.|\n|$)/i
    ];
  }

  async processIncomingSMS(
    from: string,
    content: string,
    timestamp: number
  ): Promise<SMSReceipt | null> {
    // Verify sender is authorized
    if (!this.config.phoneNumbers.includes(from)) {
      console.warn(`Unauthorized SMS sender: ${from}`);
      return null;
    }

    // Check if this is a receipt message
    const receiptData = this.parseReceiptContent(content);
    if (!receiptData) {
      return null;
    }

    const receipt: SMSReceipt = {
      id: `sms-${timestamp}-${from}`,
      from,
      date: new Date(timestamp).toISOString(),
      content,
      ...receiptData
    };

    try {
      // Convert SMS content to a virtual receipt image
      const virtualReceipt = await this.createVirtualReceipt(receipt);
      const parsedReceipt = await uploadAndParseReceipt(virtualReceipt);
      
      return {
        ...receipt,
        receiptUrl: parsedReceipt.receiptUrl
      };
    } catch (error) {
      console.error('Failed to process SMS receipt:', error);
      return receipt;
    }
  }

  private parseReceiptContent(content: string): {
    amount?: number;
    merchant?: string;
  } | null {
    for (const pattern of this.receiptPatterns) {
      const match = content.match(pattern);
      if (match) {
        // Different patterns have different group positions
        const [_, group1, group2] = match;
        
        // Try to determine which group is amount vs merchant based on pattern
        const amount = parseFloat(group1.includes('$') ? group1.replace('$', '') : group2);
        const merchant = group1.includes('$') ? group2 : group1;

        if (!isNaN(amount)) {
          return { amount, merchant };
        }
      }
    }

    return null;
  }

  private async createVirtualReceipt(receipt: SMSReceipt): Promise<File> {
    // Create a virtual receipt image from SMS content
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;
    
    if (ctx) {
      // Set background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text style
      ctx.fillStyle = 'black';
      ctx.font = '16px monospace';
      
      // Draw receipt content
      const lines = [
        `Date: ${new Date(receipt.date).toLocaleString()}`,
        `From: ${receipt.merchant || receipt.from}`,
        `Amount: $${receipt.amount?.toFixed(2) || 'N/A'}`,
        '',
        'Original SMS:',
        ...this.wrapText(receipt.content, 40)
      ];
      
      lines.forEach((line, index) => {
        ctx.fillText(line, 20, 40 + (index * 20));
      });
    }
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob(blob => resolve(blob!), 'image/png')
    );
    
    // Create file from blob
    return new File(
      [blob],
      `sms-receipt-${receipt.id}.png`,
      { type: 'image/png' }
    );
  }

  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length <= maxLength) {
        currentLine += (currentLine.length === 0 ? '' : ' ') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  // Method to register a new receipt pattern
  addReceiptPattern(pattern: RegExp): void {
    this.receiptPatterns.push(pattern);
  }

  // Method to authorize a new phone number
  authorizePhoneNumber(phoneNumber: string): void {
    if (!this.config.phoneNumbers.includes(phoneNumber)) {
      this.config.phoneNumbers.push(phoneNumber);
    }
  }

  // Method to add a new shortcode
  addShortcode(shortcode: string): void {
    if (!this.config.shortcodes.includes(shortcode)) {
      this.config.shortcodes.push(shortcode);
    }
  }
} 