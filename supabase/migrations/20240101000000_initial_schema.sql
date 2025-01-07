-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create expenses table
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  account_id text,
  account_name text,
  account_type text,
  account_last_four text,
  institution text,
  date timestamp with time zone not null,
  description text not null,
  amount decimal(12,2) not null,
  currency text not null default 'USD',
  category text,
  status text not null default 'pending',
  merchant text,
  type text check (type in ('business', 'personal')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  details jsonb default '{}'::jsonb,
  receipt_id uuid
);

-- Create receipts table
create table if not exists receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  date timestamp with time zone not null,
  merchant text,
  total decimal(12,2),
  status text not null default 'pending' check (status in ('pending', 'matched', 'unmatched')),
  expense_id uuid references expenses(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create reports table
create table if not exists reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  type text check (type in ('business', 'personal')) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null default 'draft',
  total_amount decimal(12,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  metadata jsonb default '{}'::jsonb
);

-- Create report_expenses junction table
create table if not exists report_expenses (
  report_id uuid references reports(id) on delete cascade,
  expense_id uuid references expenses(id) on delete cascade,
  primary key (report_id, expense_id)
);

-- Create RLS policies
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table receipts enable row level security;
alter table reports enable row level security;
alter table report_expenses enable row level security;

-- Profiles policies
create policy "Users can view own profile" 
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- Expenses policies
create policy "Users can view own expenses" 
  on expenses for select using (auth.uid() = user_id);

create policy "Users can create own expenses" 
  on expenses for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses" 
  on expenses for update using (auth.uid() = user_id);

create policy "Users can delete own expenses" 
  on expenses for delete using (auth.uid() = user_id);

-- Receipts policies
create policy "Users can view own receipts" 
  on receipts for select using (auth.uid() = user_id);

create policy "Users can create own receipts" 
  on receipts for insert with check (auth.uid() = user_id);

create policy "Users can update own receipts" 
  on receipts for update using (auth.uid() = user_id);

create policy "Users can delete own receipts" 
  on receipts for delete using (auth.uid() = user_id);

-- Reports policies
create policy "Users can view own reports" 
  on reports for select using (auth.uid() = user_id);

create policy "Users can create own reports" 
  on reports for insert with check (auth.uid() = user_id);

create policy "Users can update own reports" 
  on reports for update using (auth.uid() = user_id);

create policy "Users can delete own reports" 
  on reports for delete using (auth.uid() = user_id);

-- Report expenses policies
create policy "Users can view own report expenses" 
  on report_expenses for select using (
    exists (
      select 1 from reports 
      where reports.id = report_expenses.report_id 
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can manage own report expenses" 
  on report_expenses for all using (
    exists (
      select 1 from reports 
      where reports.id = report_expenses.report_id 
      and reports.user_id = auth.uid()
    )
  ); 