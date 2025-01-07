import { z } from 'zod';

// Validation patterns
const patterns = {
  // API key patterns
  openaiKey: /^sk-[a-zA-Z0-9]{32,}$/,
  mindeeKey: /^[a-f0-9]{32}$/,
  r2Key: /^[A-Za-z0-9+/]{32,}$/,
  
  // URL patterns
  r2Url: /^https:\/\/.*\.r2\.dev$/,
  supabaseUrl: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
  tellerUrl: /^https:\/\/api\.teller\.io/,
  
  // ID patterns
  r2AccountId: /^[0-9a-f]{32}$/,
  tellerId: /^app_[a-z0-9]{20}$/,
};

// Enhanced schema with specific validation rules
const envSchema = z.object({
  // R2 Storage
  r2: z.object({
    accountId: z.string()
      .min(32)
      .regex(patterns.r2AccountId, 'Invalid R2 account ID format'),
    accessKeyId: z.string()
      .min(20)
      .regex(patterns.r2Key, 'Invalid R2 access key format'),
    secretAccessKey: z.string()
      .min(40)
      .regex(patterns.r2Key, 'Invalid R2 secret key format'),
    bucketName: z.string()
      .min(3)
      .max(63)
      .regex(/^[a-z0-9-]+$/, 'Bucket name must be lowercase alphanumeric with hyphens'),
    publicUrl: z.string()
      .url()
      .regex(patterns.r2Url, 'Invalid R2 public URL format'),
  }),

  // Supabase
  supabase: z.object({
    url: z.string()
      .url()
      .regex(patterns.supabaseUrl, 'Invalid Supabase URL format'),
    anonKey: z.string()
      .min(90)
      .regex(/^eyJ.*/, 'Invalid Supabase anon key format'),
  }),

  // Mindee
  mindee: z.object({
    apiKey: z.string()
      .regex(patterns.mindeeKey, 'Invalid Mindee API key format'),
  }),

  // Teller
  teller: z.object({
    appId: z.string()
      .regex(patterns.tellerId, 'Invalid Teller app ID format'),
    environment: z.enum(['sandbox', 'development', 'production'])
      .refine(
        (env) => process.env.NODE_ENV === 'production' ? env !== 'sandbox' : true,
        'Cannot use sandbox environment in production'
      ),
    apiUrl: z.string()
      .url()
      .regex(patterns.tellerUrl, 'Invalid Teller API URL'),
  }),

  // OpenAI
  openai: z.object({
    apiKey: z.string()
      .regex(patterns.openaiKey, 'Invalid OpenAI API key format'),
  }),
}).refine(
  (env) => {
    // Additional cross-field validations
    if (process.env.NODE_ENV === 'production') {
      // Ensure production URLs
      if (env.supabase.url.includes('localhost')) return false;
      if (env.teller.apiUrl.includes('localhost')) return false;
    }
    return true;
  },
  'Invalid configuration for production environment'
);

export type Env = z.infer<typeof envSchema>;

// Enhanced error handling for environment variables
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  
  // Remove any whitespace
  const cleanValue = value.trim();
  
  // Basic security checks
  if (cleanValue.includes('${')) {
    throw new Error(`Possible injection attempt in ${key}`);
  }
  
  return cleanValue;
}

// Encryption key for sensitive values (if available)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Function to decrypt sensitive values if encryption is enabled
function decryptIfNeeded(value: string): string {
  if (!ENCRYPTION_KEY || !value.startsWith('enc:')) {
    return value;
  }
  
  try {
    // Implementation would go here if encryption is added
    return value.slice(4); // Remove 'enc:' prefix
  } catch (error) {
    throw new Error('Failed to decrypt sensitive value');
  }
}

export const env = envSchema.parse({
  r2: {
    accountId: getEnvVar('NEXT_PUBLIC_R2_ACCOUNT_ID'),
    accessKeyId: getEnvVar('NEXT_PUBLIC_R2_ACCESS_KEY_ID'),
    secretAccessKey: decryptIfNeeded(getEnvVar('NEXT_PUBLIC_R2_SECRET_ACCESS_KEY')),
    bucketName: getEnvVar('NEXT_PUBLIC_R2_BUCKET_NAME'),
    publicUrl: getEnvVar('NEXT_PUBLIC_R2_PUBLIC_URL'),
  },
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: decryptIfNeeded(getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')),
  },
  mindee: {
    apiKey: decryptIfNeeded(getEnvVar('NEXT_PUBLIC_MINDEE_API_KEY')),
  },
  teller: {
    appId: getEnvVar('NEXT_PUBLIC_TELLER_APP_ID'),
    environment: getEnvVar('NEXT_PUBLIC_TELLER_ENV') as 'sandbox' | 'development' | 'production',
    apiUrl: getEnvVar('NEXT_PUBLIC_TELLER_API_URL'),
  },
  openai: {
    apiKey: decryptIfNeeded(getEnvVar('OPENAI_API_KEY')),
  },
});

// Utility function to check if running on server
export const isServer = typeof window === 'undefined';

// Utility function to check if running in development
export const isDevelopment = process.env.NODE_ENV === 'development';

// Enhanced security checks for environment
export const isSecureEnvironment = isServer && !isDevelopment;

// Export a safe version of env for client-side use (excluding sensitive values)
export const clientEnv = {
  r2: {
    publicUrl: env.r2.publicUrl,
    bucketName: env.r2.bucketName,
  },
  supabase: {
    url: env.supabase.url,
    anonKey: env.supabase.anonKey,
  },
  teller: {
    environment: env.teller.environment,
    apiUrl: env.teller.apiUrl,
  },
}; 