-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table tasks enable row level security;

-- Create policies
create policy "Users can only see their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can only delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table tasks;
