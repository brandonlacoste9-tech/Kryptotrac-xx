-- Fix Stripe subscription tables and add subscription_events

-- Ensure user_subscriptions has correct schema
alter table user_subscriptions add column if not exists customer_id text;
alter table user_subscriptions add column if not exists subscription_id text;
alter table user_subscriptions add column if not exists plan_type text default 'free';
alter table user_subscriptions add column if not exists status text default 'active';
alter table user_subscriptions add column if not exists current_period_end timestamp with time zone;

-- Create subscription_events for audit trail
create table if not exists subscription_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  stripe_event_id text,
  subscription_id text,
  customer_id text,
  plan_type text,
  amount integer,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table subscription_events enable row level security;

-- RLS policies
create policy "subscription_events_read_own"
  on subscription_events for select
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists subscription_events_user_id_idx on subscription_events(user_id);
create index if not exists subscription_events_stripe_event_id_idx on subscription_events(stripe_event_id);
