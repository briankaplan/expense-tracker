import { useTellerConnect } from '@teller-io/connect-react';
import { useCallback } from 'react';
import { DatabaseService } from '../services/DatabaseService';

export function useTeller() {
  const { open } = useTellerConnect({
    applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID!,
    environment: process.env.NEXT_PUBLIC_TELLER_ENVIRONMENT as 'sandbox' | 'development' | 'production',
    onSuccess: async (enrollment) => {
      // Handle successful enrollment
      console.log('Teller enrollment successful:', enrollment);
      
      // Here you would typically store the enrollment ID and begin syncing transactions
      // This could involve setting up a webhook endpoint or polling for new transactions
    },
    onExit: (error) => {
      if (error) {
        console.error('Teller connection error:', error);
      }
    },
  });

  const syncTransactions = useCallback(async (enrollmentId: string) => {
    try {
      // Fetch transactions from Teller API
      const response = await fetch(`/api/teller/transactions/${enrollmentId}`);
      const transactions = await response.json();

      // Convert Teller transactions to expenses
      const expenses = transactions.map((transaction: any) => ({
        accountId: transaction.account_id,
        accountName: transaction.account.name,
        accountType: transaction.account.type,
        accountLastFour: transaction.account.last_four,
        institution: transaction.account.institution.name,
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        currency: 'USD', // Teller currently only supports USD
        category: transaction.details?.category || 'uncategorized',
        status: 'pending',
        merchant: transaction.details?.merchant?.name,
        type: 'business', // Default to business, can be updated later
        details: {
          isCredit: transaction.amount > 0,
          originalAmount: transaction.amount,
          processingStatus: transaction.status,
          counterpartyType: transaction.details?.counterparty?.type,
        },
      }));

      // Batch create expenses
      for (const expense of expenses) {
        await DatabaseService.createExpense(expense);
      }

      return expenses;
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      throw error;
    }
  }, []);

  return {
    connectBank: open,
    syncTransactions,
  };
} 