import { auth } from '@/lib/firebase/config';
import { 
  fetchExpensesFromDb, 
  createExpenseInDb,
  updateExpenseInDb,
  deleteExpenseFromDb 
} from '@/lib/db/expenses';
import { Expense } from '@/lib/hooks/useExpenses';

export async function fetchExpenses(dateRange?: [Date, Date]): Promise<Expense[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  return fetchExpensesFromDb(user.uid, dateRange);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  return createExpenseInDb(user.uid, expense);
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await updateExpenseInDb(id, data);
}

export async function deleteExpense(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await deleteExpenseFromDb(id);
} 