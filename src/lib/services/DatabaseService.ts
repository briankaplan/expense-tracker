import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types/expenses';
import type { Receipt } from '@/types/receipts';
import type { Database } from '@/types/supabase';

export class DatabaseService {
  // Expense Operations
  static async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateExpense(id: string, expense: Partial<Expense>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getExpenses(filters?: {
    startDate?: string;
    endDate?: string;
    type?: 'business' | 'personal';
    status?: string;
  }) {
    let query = supabase.from('expenses').select('*');

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Receipt Operations
  static async createReceipt(receipt: Omit<Receipt, 'id' | 'uploadedAt'>) {
    const { data, error } = await supabase
      .from('receipts')
      .insert([receipt])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateReceipt(id: string, receipt: Partial<Receipt>) {
    const { data, error } = await supabase
      .from('receipts')
      .update(receipt)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReceipts(filters?: {
    status?: 'pending' | 'matched' | 'unmatched';
    expenseId?: string;
  }) {
    let query = supabase.from('receipts').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.expenseId) {
      query = query.eq('expense_id', filters.expenseId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
    return data;
  }

  // Report Operations
  static async createReport(report: {
    title: string;
    type: 'business' | 'personal';
    startDate: string;
    endDate: string;
    status?: string;
  }) {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateReport(id: string, report: {
    title?: string;
    status?: string;
    totalAmount?: number;
  }) {
    const { data, error } = await supabase
      .from('reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReports(filters?: {
    type?: 'business' | 'personal';
    status?: string;
  }) {
    let query = supabase.from('reports').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Report Expense Operations
  static async addExpensesToReport(reportId: string, expenseIds: string[]) {
    const reportExpenses = expenseIds.map(expenseId => ({
      report_id: reportId,
      expense_id: expenseId
    }));

    const { error } = await supabase
      .from('report_expenses')
      .insert(reportExpenses);

    if (error) throw error;
  }

  static async removeExpenseFromReport(reportId: string, expenseId: string) {
    const { error } = await supabase
      .from('report_expenses')
      .delete()
      .eq('report_id', reportId)
      .eq('expense_id', expenseId);

    if (error) throw error;
  }

  static async getReportExpenses(reportId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .innerJoin('report_expenses', {
        'expenses.id': 'report_expenses.expense_id'
      })
      .eq('report_expenses.report_id', reportId);

    if (error) throw error;
    return data;
  }
} 