-- Supabase / PostgreSQL schema for OneKlyx orders

create table if not exists orders (
  id bigserial primary key,
  reference_number varchar(64) not null unique,
  timestamp timestamptz not null default now(),
  full_name varchar(255) not null,
  email varchar(255) not null,
  whatsapp varchar(64) not null,
  company varchar(255),
  project_type varchar(128),
  budget varchar(128),
  project_title varchar(255),
  project_desc text,
  deadline date,
  reference_links text[],
  tech_stack text[],
  file_name varchar(1024),
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_reference on orders(reference_number);
create index if not exists idx_orders_email on orders(email);
