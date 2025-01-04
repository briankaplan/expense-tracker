import { supabase } from './supabase';

export async function getDocuments<T>(
  table: string,
  query: any = {}
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .match(query);

  if (error) throw error;
  return data as T[];
}

export async function addDocument<T>(
  table: string,
  document: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert([document])
    .select()
    .single();

  if (error) throw error;
  return data as T;
}

export async function updateDocument<T>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as T;
}

export async function deleteDocument(
  table: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
} 