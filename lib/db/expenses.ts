import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Expense } from '@/lib/hooks/useExpenses';

export async function fetchExpensesFromDb(userId: string, dateRange?: [Date, Date]) {
  const expensesRef = collection(db, 'expenses');
  
  let q = query(
    expensesRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  if (dateRange) {
    q = query(
      q,
      where('date', '>=', Timestamp.fromDate(dateRange[0])),
      where('date', '<=', Timestamp.fromDate(dateRange[1]))
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate().toISOString(),
  })) as Expense[];
}

export async function createExpenseInDb(
  userId: string, 
  expense: Omit<Expense, 'id'>
) {
  const expensesRef = collection(db, 'expenses');
  const docRef = await addDoc(expensesRef, {
    ...expense,
    userId,
    date: Timestamp.fromDate(new Date(expense.date)),
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...expense,
  };
}

export async function updateExpenseInDb(
  expenseId: string,
  data: Partial<Expense>
) {
  const expenseRef = doc(db, 'expenses', expenseId);
  await updateDoc(expenseRef, {
    ...data,
    ...(data.date && { date: Timestamp.fromDate(new Date(data.date)) }),
    updatedAt: Timestamp.now(),
  });
}

export async function deleteExpenseFromDb(expenseId: string) {
  const expenseRef = doc(db, 'expenses', expenseId);
  await deleteDoc(expenseRef);
} 