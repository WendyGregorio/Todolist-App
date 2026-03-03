-- Update tasks table with new fields for reminders, repetition and priority
alter table tasks add column repeat_type text default 'none'; -- none, daily, weekly, monthly
alter table tasks add column completed_at timestamp with time zone;
alter table tasks add column reminder_sent boolean default false;
alter table tasks add column priority text default 'medium'; -- low, medium, high

-- Index for better performance on common queries
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_due_date on tasks(due_date);
create index idx_tasks_completed on tasks(completed);

-- Update existing tasks to have a completed_at if they are already completed
update tasks set completed_at = now() where completed = true and completed_at is null;
