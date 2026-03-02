-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  color text default '#a0c4ff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update tasks table
alter table tasks add column category_id uuid references categories(id) on delete set null;
alter table tasks add column is_pending boolean default false;
alter table tasks add column due_date timestamp with time zone;

-- Enable RLS for categories
alter table categories enable row level security;

-- Create policies for categories
create policy "Users can only see their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can only delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table categories;
