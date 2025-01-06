# Database Migrations

## Schema Overview

The expense tracking system uses three main tables:
1. `expenses` - Core expense records
2. `receipts` - Receipt data and metadata
3. `bank_transactions` - Synced bank transaction data

## Initial Setup

### 1. Create Tables

```sql
-- Create expenses table
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

-- Create receipts table
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

-- Create bank_transactions table
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

### 2. Create Indexes

```sql
-- Indexes for expenses
create index idx_expenses_user_date on expenses(user_id, date);
create index idx_expenses_receipt on expenses(receipt_id);
create index idx_expenses_split_from on expenses(split_from_id);
create index idx_expenses_merchant on expenses(merchant);

-- Indexes for receipts
create index idx_receipts_user_date on receipts(user_id, date);
create index idx_receipts_merchant on receipts(merchant);
create index idx_receipts_status on receipts(status);

-- Indexes for bank_transactions
create index idx_transactions_user_date on bank_transactions(user_id, date);
create index idx_transactions_merchant on bank_transactions(merchant_name);
create index idx_transactions_matched on bank_transactions(matched_receipt_id, matched_expense_id);
```

### 3. Create Functions

```sql
-- Update timestamp trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger expenses_updated_at
  before update on expenses
  for each row
  execute function update_updated_at();

create trigger receipts_updated_at
  before update on receipts
  for each row
  execute function update_updated_at();

create trigger bank_transactions_updated_at
  before update on bank_transactions
  for each row
  execute function update_updated_at();
```

### 4. RLS Policies

```sql
-- Enable RLS
alter table expenses enable row level security;
alter table receipts enable row level security;
alter table bank_transactions enable row level security;

-- Policies for expenses
create policy "Users can view their own expenses"
  on expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on expenses for update
  using (auth.uid() = user_id);

-- Similar policies for receipts and bank_transactions
```

## Maintenance

### Cleanup Jobs

```sql
-- Remove old unmatched receipts
create or replace function cleanup_unmatched_receipts()
returns void as $$
begin
  delete from receipts
  where status = 'pending'
    and matched_expense_id is null
    and created_at < now() - interval '30 days';
end;
$$ language plpgsql;

-- Schedule cleanup job
select cron.schedule(
  'cleanup-unmatched-receipts',
  '0 0 * * *', -- Run daily at midnight
  'select cleanup_unmatched_receipts();'
);
```

### Monitoring

```sql
-- View for monitoring split expenses
create view split_expense_summary as
select
  e.id,
  e.amount as original_amount,
  array_agg(s.amount) as split_amounts,
  count(*) as split_count
from expenses e
join expenses s on s.split_from_id = e.id
group by e.id, e.amount;

-- View for monitoring unmatched transactions
create view unmatched_transactions as
select *
from bank_transactions
where matched_receipt_id is null
  and matched_expense_id is null
  and created_at < now() - interval '7 days';
```

## Migration Notes

1. Always backup before migrations
2. Test migrations in development first
3. Use transaction blocks for safety
4. Add appropriate indexes for new queries
5. Update RLS policies for new tables
6. Document schema changes 