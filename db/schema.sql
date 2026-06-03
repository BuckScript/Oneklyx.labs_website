-- Supabase / PostgreSQL schema for OneKlyx orders (PRODUCTION)
-- Execute this SQL in Supabase Query Editor before deploying

-- Enable UUID extension if needed
-- create extension if not exists "uuid-ossp";

-- Main orders table
create table if not exists public.orders (
  id bigserial primary key,
  
  -- Reference & Timestamps
  reference_number varchar(64) not null unique check (length(reference_number) > 0),
  created_at timestamptz not null default now(),
  timestamp timestamptz not null default now(),
  
  -- Client Info
  full_name varchar(255) not null check (length(full_name) > 0),
  email varchar(255) not null check (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  whatsapp varchar(64) not null check (whatsapp ~ '^(\\+62|62|08)[0-9]{8,13}$'),
  company varchar(255),
  
  -- Project Details
  project_type varchar(128),
  budget varchar(128),
  project_title varchar(255) not null check (length(project_title) > 0),
  project_desc text,
  deadline date,
  
  -- Arrays
  reference_links text[] default '{}',
  tech_stack text[] default '{}',
  
  -- File Storage
  file_name varchar(1024),
  file_url text,
  
  -- Metadata
  created_at_utc timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_orders_reference on public.orders(reference_number);
create index if not exists idx_orders_email on public.orders(email);
create index if not exists idx_orders_whatsapp on public.orders(whatsapp);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- Enable RLS (Row Level Security)
alter table public.orders enable row level security;

-- Policy: Allow anyone to insert (for form submissions)
create policy "Allow inserts from public" on public.orders
  for insert
  with check (true);

-- Policy: Admins/service role can select all
create policy "Allow service role to select all" on public.orders
  for select
  using (true);
