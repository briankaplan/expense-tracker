# API Integrations

## Overview

The expense tracking system integrates with several external APIs:
1. Mindee - For receipt OCR and data extraction
2. Teller - For bank transaction syncing
3. Cloudflare R2 - For receipt image storage
4. OpenAI - For enhanced merchant categorization

## 1. Mindee Integration

### Setup
```typescript
// lib/services/mindee.ts
import { Client } from 'mindee';

export class MindeeService {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ apiKey });
  }

  async processReceipt(file: File): Promise<MindeeResult> {
    try {
      const result = await this.client.parse({
        input: file,
        inputType: 'receipt'
      });

      return {
        merchant: result.merchant?.value,
        date: result.date?.value,
        total: result.total?.value,
        items: result.lineItems?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount
        })),
        metadata: {
          confidence: result.confidence,
          raw: result.raw
        }
      };
    } catch (error) {
      throw new OCRError('Failed to process receipt', { cause: error });
    }
  }
}
```

## 2. Teller Integration

### Setup
```typescript
// lib/services/teller.ts
import { TellerConnect } from '@teller/connect-react';

export class TellerService {
  private client: TellerConnect;

  constructor(config: TellerConfig) {
    this.client = new TellerConnect({
      environment: config.environment,
      applicationId: config.applicationId
    });
  }

  async getTransactions(accountId: string, options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<Transaction[]> {
    const response = await this.client.transactions.list(accountId, {
      count: 100,
      ...options
    });

    return response.data.map(this.formatTransaction);
  }

  private formatTransaction(raw: any): Transaction {
    return {
      id: raw.id,
      amount: raw.amount,
      date: raw.date,
      description: raw.description,
      merchant: raw.merchant?.name,
      category: raw.category
    };
  }
}
```

## 3. Cloudflare R2 Integration

### Setup
```typescript
// lib/services/storage.ts
import { S3Client } from '@aws-sdk/client-s3';

export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(config: R2Config) {
    this.client = new S3Client({
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    this.bucket = config.bucketName;
  }

  async uploadReceipt(file: File): Promise<string> {
    const key = `receipts/${Date.now()}-${file.name}`;
    await this.client.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: file.type
    });

    return `${this.config.publicUrl}/${key}`;
  }
}
```

## 4. OpenAI Integration

### Setup
```typescript
// lib/services/categorization.ts
import { OpenAI } from 'openai';

export class CategorizationService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async categorizeExpense(description: string, merchant: string): Promise<{
    category: string;
    confidence: number;
  }> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are a financial categorization assistant.'
      }, {
        role: 'user',
        content: `Categorize this expense:\nMerchant: ${merchant}\nDescription: ${description}`
      }],
      temperature: 0.3,
      max_tokens: 50
    });

    return {
      category: completion.choices[0].message.content,
      confidence: completion.choices[0].finish_reason === 'stop' ? 0.9 : 0.7
    };
  }
}
```

## Error Handling

### Custom Error Classes
```typescript
// lib/errors.ts
export class OCRError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'OCRError';
  }
}

export class TransactionSyncError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TransactionSyncError';
  }
}
```

### Error Handling Examples
```typescript
// Receipt processing
try {
  const result = await mindeeService.processReceipt(file);
} catch (error) {
  if (error instanceof OCRError) {
    console.error('OCR processing failed:', error.message);
    // Handle OCR-specific error
  } else {
    console.error('Unknown error:', error);
    // Handle general error
  }
}

// Transaction sync
try {
  await tellerService.syncTransactions();
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    await tellerService.syncTransactions();
  } else {
    throw new TransactionSyncError('Failed to sync transactions', {
      cause: error
    });
  }
}
```

## Rate Limiting

### Implementation
```typescript
// lib/utils/rate-limit.ts
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.window);
    
    if (this.timestamps.length >= this.limit) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.window - (now - oldestTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.timestamps.push(now);
  }
}
```

## Testing

### API Mocks
```typescript
// tests/mocks/mindee.ts
export const mockMindeeService = {
  processReceipt: jest.fn().mockResolvedValue({
    merchant: 'Test Merchant',
    total: 42.00,
    date: '2024-01-01'
  })
};
```

### Integration Tests
```typescript
// tests/integration/api.test.ts
describe('API Integration', () => {
  it('processes receipt successfully', async () => {
    const file = new File(['receipt'], 'receipt.jpg', {
      type: 'image/jpeg'
    });
    
    const result = await mindeeService.processReceipt(file);
    expect(result).toHaveProperty('merchant');
    expect(result).toHaveProperty('total');
  });
}); 