# Expense Tracking System Documentation

## Overview

A comprehensive expense tracking system with support for:
- Business/Personal expense splitting
- Receipt processing and OCR
- Bank transaction matching
- Digital receipt beautification

## System Components

### 1. Database Schema (Supabase)

```sql
-- Expenses table
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  amount decimal(10,2) not null,
  description text,
  date date not null,
  category text,
  merchant text,
  status text default 'pending',
  split_from_id uuid references expenses(id),
  has_splits boolean default false,
  receipt_id uuid references receipts(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Receipts table
create table receipts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  image_url text,
  merchant text,
  date date,
  total decimal(10,2),
  items jsonb,
  metadata jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Bank transactions table
create table bank_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  amount decimal(10,2) not null,
  merchant_name text,
  date date not null,
  description text,
  category text,
  matched_receipt_id uuid references receipts(id),
  matched_expense_id uuid references expenses(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Setup Instructions

1. **Environment Variables**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Cloudflare R2
NEXT_PUBLIC_R2_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_R2_ACCESS_KEY_ID=your_access_key
NEXT_PUBLIC_R2_SECRET_ACCESS_KEY=your_secret_key
NEXT_PUBLIC_R2_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_R2_PUBLIC_URL=your_public_url

# Mindee
NEXT_PUBLIC_MINDEE_API_KEY=your_mindee_key

# Teller
NEXT_PUBLIC_TELLER_APP_ID=your_teller_app_id
NEXT_PUBLIC_TELLER_ENV=sandbox
NEXT_PUBLIC_TELLER_API_URL=https://api.teller.io

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

2. **Dependencies**
```bash
npm install @supabase/supabase-js @teller/connect-react mindee date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @hookform/resolvers react-hook-form zod
```

## Core Features

### Expense Splitting
- Percentage-based splitting
- Manual amount adjustments
- Split expense tracking
- Parent-child relationship for split expenses

### Receipt Processing
- OCR processing via Mindee API
- Digital receipt beautification
- Receipt-to-transaction matching
- Receipt storage in Cloudflare R2

### Transaction Matching
- Amount matching with tip consideration
- Date proximity
- Merchant name similarity
- Category matching

## Best Practices

1. **Receipt Processing**
   - Always validate receipt data before processing
   - Store original receipt image
   - Generate beautified version for display

2. **Expense Splitting**
   - Validate split amounts match total
   - Maintain parent-child relationships
   - Prevent double-splitting

3. **Transaction Matching**
   - Consider tips and tax in amount matching
   - Use fuzzy matching for merchant names
   - Track match confidence scores

## Error Handling

```typescript
try {
  const result = await mindeeService.processReceipt(file);
} catch (error) {
  if (error instanceof OCRError) {
    // Handle OCR-specific errors
  }
  // Handle other errors
}
```

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Follow commit message conventions 