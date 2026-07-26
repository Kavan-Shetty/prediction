-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text,
    username text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. GROUPS
create table if not exists public.groups (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    invite_code text unique not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;
create policy "Groups are viewable by everyone." on public.groups for select using (true);
create policy "Authenticated users can create groups." on public.groups for insert with check (auth.role() = 'authenticated');
create policy "Group creators can update their groups." on public.groups for update using (auth.uid() = created_by);

-- 3. GROUP MEMBERS (Tracks user balances per group)
create table if not exists public.group_members (
    group_id uuid references public.groups(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    balance numeric default 1000.00 not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (group_id, user_id)
);

alter table public.group_members enable row level security;
create policy "Group members viewable by everyone." on public.group_members for select using (true);
create policy "Users can join groups." on public.group_members for insert with check (auth.uid() = user_id);
create policy "Users can update their balance." on public.group_members for update using (auth.uid() = user_id);

-- 4. MARKETS (The betting questions)
create table if not exists public.markets (
    id uuid default uuid_generate_v4() primary key,
    group_id uuid references public.groups(id) on delete cascade not null,
    creator_id uuid references auth.users(id) on delete set null,
    question text not null,
    closing_time timestamp with time zone not null,
    status text default 'open' check (status in ('open', 'closed', 'resolved')),
    volume numeric default 0.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.markets enable row level security;
create policy "Markets are viewable by everyone." on public.markets for select using (true);
create policy "Authenticated users can create markets." on public.markets for insert with check (auth.role() = 'authenticated');
create policy "Market creators can update their markets." on public.markets for update using (auth.uid() = creator_id);

-- 5. OUTCOMES (Yes / No options)
create table if not exists public.outcomes (
    id uuid default uuid_generate_v4() primary key,
    market_id uuid references public.markets(id) on delete cascade not null,
    text text not null,
    current_price numeric default 0.50 not null,
    shares_pool numeric default 1000.00 not null
);

alter table public.outcomes enable row level security;
create policy "Outcomes are viewable by everyone." on public.outcomes for select using (true);
create policy "Authenticated users can create outcomes." on public.outcomes for insert with check (auth.role() = 'authenticated');
create policy "Anyone can update outcome prices." on public.outcomes for update using (true);

-- 6. TRADES (Individual bets / share purchases)
create table if not exists public.trades (
    id uuid default uuid_generate_v4() primary key,
    market_id uuid references public.markets(id) on delete cascade not null,
    outcome_id uuid references public.outcomes(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    shares numeric not null,
    amount_paid numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trades enable row level security;
create policy "Trades are viewable by everyone." on public.trades for select using (true);
create policy "Users can insert their own trades." on public.trades for insert with check (auth.uid() = user_id);

-- Trigger to automatically create a profile when a new Supabase user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
