-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Followed people
create table if not exists followed_people (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  person_id int not null,
  name text not null,
  profile_path text,
  known_for_department text,
  added_at timestamp with time zone default now(),
  unique(user_id, person_id)
);

-- Watchlist items
create table if not exists watchlist_items (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  media_type text check (media_type in ('movie','tv')) not null,
  tmdb_id int not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  added_at timestamp with time zone default now(),
  unique(user_id, media_type, tmdb_id)
);

-- Watched credits per person
create table if not exists person_watched_credits (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  person_id int not null,
  media_type text check (media_type in ('movie','tv')) not null,
  tmdb_id int not null,
  title text not null,
  added_at timestamp with time zone default now(),
  unique(user_id, person_id, media_type, tmdb_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table followed_people enable row level security;
alter table watchlist_items enable row level security;
alter table person_watched_credits enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Followed people policies
create policy "Users can CRUD own follows" on followed_people
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Watchlist policies
create policy "Users can CRUD own watchlist" on watchlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Watched credits policies
create policy "Users can CRUD own watched credits" on person_watched_credits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
