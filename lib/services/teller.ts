import { Expense } from '@/types/expenses';

const TELLER_API_URL = process.env.NEXT_PUBLIC_TELLER_API_URL || 'https://api.teller.io';

interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: {
    value: number;
    currency: string;
  };
  running_balance: {
    value: number;
    currency: string;
  };
  type: string;
  status: string;
  merchant: {
    name: string;
    category: string;
  };
  details?: {
    processing_status: string;
    category_id?: string;
    counterparty?: {
      name: string;
      type: string;
    };
  };
}

interface TellerAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  status: string;
  institution: {
    name: string;
  };
  last_four: string;
  currency: string;
  numbers: {
    account: string;
    routing?: string;
  };
  balances: {
    available: number;
    current: number;
    ledger: number;
  };
}

export interface AccountWithTransactions {
  account: TellerAccount;
  transactions: Expense[];
  balance: {
    available: number;
    current: number;
    currency: string;
  };
}

// Enhanced transaction categorization with machine learning-like scoring
function categorizeTransaction(transaction: TellerTransaction): string {
  const description = transaction.description.toLowerCase();
  const merchantCategory = transaction.merchant.category.toLowerCase();
  const merchantName = transaction.merchant.name.toLowerCase();
  const amount = Math.abs(transaction.amount.value);

  // Category definitions with weighted keywords and rules
  const categories = [
    {
      name: 'Food & Dining',
      keywords: {
        high: ['restaurant', 'cafe', 'coffee', 'pizzeria', 'bakery'],
        medium: ['doordash', 'uber eats', 'grubhub', 'food', 'dining'],
        low: ['eat', 'kitchen', 'bar']
      },
      merchantTypes: ['restaurant', 'food_delivery', 'cafe'],
      amountRange: { min: 5, max: 500 }
    },
    {
      name: 'Transportation',
      keywords: {
        high: ['uber', 'lyft', 'taxi', 'transit', 'metro'],
        medium: ['parking', 'gas', 'fuel', 'train'],
        low: ['transport', 'travel']
      },
      merchantTypes: ['transportation', 'ride_share', 'gas_station', 'parking'],
      amountRange: { min: 2, max: 200 }
    },
    {
      name: 'Shopping',
      keywords: {
        high: ['amazon', 'walmart', 'target', 'costco', 'store'],
        medium: ['market', 'shop', 'retail', 'buy'],
        low: ['purchase', 'outlet']
      },
      merchantTypes: ['retail', 'department_store', 'online_retail'],
      amountRange: { min: 1, max: 5000 }
    },
    {
      name: 'Travel',
      keywords: {
        high: ['hotel', 'airbnb', 'airline', 'flight', 'booking.com'],
        medium: ['resort', 'vacation', 'travel', 'motel'],
        low: ['trip', 'stay', 'lodging']
      },
      merchantTypes: ['travel', 'lodging', 'airline', 'hotel'],
      amountRange: { min: 50, max: 10000 }
    },
    {
      name: 'Utilities',
      keywords: {
        high: ['electric', 'water', 'gas', 'internet', 'phone'],
        medium: ['utility', 'power', 'energy', 'telecom'],
        low: ['bill', 'service']
      },
      merchantTypes: ['utility', 'telecom'],
      amountRange: { min: 20, max: 1000 }
    },
    {
      name: 'Entertainment',
      keywords: {
        high: ['netflix', 'spotify', 'hulu', 'movie', 'theatre'],
        medium: ['streaming', 'music', 'game', 'entertainment'],
        low: ['play', 'fun', 'show']
      },
      merchantTypes: ['entertainment', 'subscription', 'streaming'],
      amountRange: { min: 5, max: 200 }
    },
    {
      name: 'Healthcare',
      keywords: {
        high: ['doctor', 'hospital', 'clinic', 'pharmacy', 'medical'],
        medium: ['health', 'dental', 'vision', 'prescription'],
        low: ['care', 'wellness', 'therapy']
      },
      merchantTypes: ['healthcare', 'pharmacy', 'medical'],
      amountRange: { min: 10, max: 5000 }
    }
  ];

  // Score each category
  const scores = categories.map(category => {
    let score = 0;

    // Check keywords with different weights
    for (const keyword of category.keywords.high) {
      if (description.includes(keyword) || merchantName.includes(keyword)) score += 3;
    }
    for (const keyword of category.keywords.medium) {
      if (description.includes(keyword) || merchantName.includes(keyword)) score += 2;
    }
    for (const keyword of category.keywords.low) {
      if (description.includes(keyword) || merchantName.includes(keyword)) score += 1;
    }

    // Check merchant types
    if (category.merchantTypes.some(type => merchantCategory.includes(type))) {
      score += 4;
    }

    // Check amount range
    if (amount >= category.amountRange.min && amount <= category.amountRange.max) {
      score += 1;
    }

    return { category: category.name, score };
  });

  // Get the category with the highest score
  const bestMatch = scores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  return bestMatch.score > 0 ? bestMatch.category : 'Uncategorized';
}

// Enhanced transaction to expense mapping
function mapTransactionToExpense(transaction: TellerTransaction, account: TellerAccount): Expense {
  // Determine if it's a credit card transaction
  const isCreditCard = account.type.toLowerCase() === 'credit' || 
                      account.subtype.toLowerCase().includes('credit');
  
  // Handle credit card transactions
  let amount = transaction.amount.value;
  if (isCreditCard) {
    // For credit cards:
    // - Negative values are payments/credits (money added to your available credit)
    // - Positive values are charges (money spent)
    amount = Math.abs(amount); // Always store as positive for consistency
  } else {
    // For debit accounts:
    // - Negative values are money spent
    // - Positive values are money received
    amount = Math.abs(amount); // Store expenses as positive values
  }

  // Determine transaction status
  const status = transaction.details?.processing_status === 'pending' ? 'pending' : 'completed';

  // Get merchant info
  const merchant = transaction.merchant.name || 
                  transaction.details?.counterparty?.name ||
                  'Unknown Merchant';

  return {
    id: transaction.id,
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    accountLastFour: account.last_four,
    institution: account.institution.name,
    date: transaction.date,
    description: transaction.description,
    amount,
    currency: account.currency || 'USD',
    category: categorizeTransaction(transaction),
    status,
    merchant,
    type: undefined, // Will be set by user (business/personal)
    createdAt: new Date().toISOString(),
    details: {
      isCredit: isCreditCard,
      originalAmount: transaction.amount.value,
      processingStatus: transaction.details?.processing_status,
      counterpartyType: transaction.details?.counterparty?.type
    }
  };
}

export async function fetchExpensesFromTeller(
  accessToken: string,
  dateRange?: [Date, Date]
): Promise<AccountWithTransactions[]> {
  if (!accessToken) {
    throw new Error('Teller access token not provided');
  }

  try {
    // Fetch accounts first
    const accountsResponse = await fetch(`${TELLER_API_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch accounts: ${accountsResponse.statusText}`);
    }
    
    const accounts: TellerAccount[] = await accountsResponse.json();

    // Fetch transactions for each account in parallel
    const accountsWithTransactions = await Promise.all(
      accounts.map(async (account) => {
        let url = `${TELLER_API_URL}/accounts/${account.id}/transactions`;
        
        // Add date range if provided
        if (dateRange) {
          const [startDate, endDate] = dateRange;
          const params = new URLSearchParams({
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
          });
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions for account ${account.id}: ${response.statusText}`);
        }
        
        const transactions: TellerTransaction[] = await response.json();
        
        // Convert to Expense type and handle credit card transactions
        const expenses = transactions.map(t => mapTransactionToExpense(t, account));

        return {
          account,
          transactions: expenses,
          balance: {
            available: account.balances.available,
            current: account.balances.current,
            currency: account.currency || 'USD'
          }
        };
      })
    );

    return accountsWithTransactions;

  } catch (error) {
    console.error('Error fetching from Teller:', error);
    throw error;
  }
}

// Enhanced metadata storage with account-specific data
export async function syncExpenseWithTeller(
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  try {
    const metadataKey = `expense_metadata_${expenseId}`;
    const existingMetadata = localStorage.getItem(metadataKey);
    const metadata = existingMetadata ? JSON.parse(existingMetadata) : {};
    
    const updatedMetadata = {
      ...metadata,
      ...updates,
      lastModified: new Date().toISOString()
    };

    // Store account-specific metadata if available
    if (updates.accountId) {
      const accountKey = `account_${updates.accountId}`;
      const accountMetadata = localStorage.getItem(accountKey);
      const existingAccountData = accountMetadata ? JSON.parse(accountMetadata) : { expenses: [] };
      
      if (!existingAccountData.expenses.includes(expenseId)) {
        existingAccountData.expenses.push(expenseId);
        localStorage.setItem(accountKey, JSON.stringify(existingAccountData));
      }
    }
    
    localStorage.setItem(metadataKey, JSON.stringify(updatedMetadata));
  } catch (error) {
    console.error('Error syncing expense metadata:', error);
    throw error;
  }
}

export async function getExpenseMetadata(expenseId: string): Promise<Partial<Expense> | null> {
  try {
    const metadataKey = `expense_metadata_${expenseId}`;
    const metadata = localStorage.getItem(metadataKey);
    return metadata ? JSON.parse(metadata) : null;
  } catch (error) {
    console.error('Error getting expense metadata:', error);
    return null;
  }
} 