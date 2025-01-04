export const TELLER_APP_ID = process.env.NEXT_PUBLIC_TELLER_APP_ID || '';
export const TELLER_ENV = (process.env.NEXT_PUBLIC_TELLER_ENV || 'sandbox') as 'sandbox' | 'development' | 'production';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 