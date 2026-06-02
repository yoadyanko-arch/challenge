-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  username text unique not null,
  avatar_url text,
  streak integer default 0,
  xp_total integer default 0,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- Per-pillar progress
create table public.progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  pillar text not null check (pillar in ('think', 'people', 'business', 'self')),
  xp integer default 0,
  cards_completed integer default 0,
  level integer default 1,
  unique(user_id, pillar)
);

-- Cards (content)
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  pillar text not null check (pillar in ('think', 'people', 'business', 'self')),
  type text not null check (type in ('concept', 'scenario', 'challenge', 'bias')),
  topic text,
  title text not null,
  content text not null,
  explanation text not null,
  options jsonb,
  correct_answer text,
  xp_reward integer not null default 10,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Card completion history
create table public.card_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  completed_at timestamptz default now(),
  was_correct boolean not null,
  xp_earned integer not null,
  unique(user_id, card_id)
);

-- Friends
create table public.friends (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  friend_id uuid references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- Badges
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon text not null,
  condition text not null
);

-- User badges (earned)
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('streak_reminder', 'friend_passed', 'badge_earned', 'friend_request')),
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Seed badges
insert into public.badges (name, description, icon, condition) values
  ('ראשון צעד', 'השלמת כרטיס ראשון', '🚀', 'cards_total >= 1'),
  ('שבוע של חוכמה', 'שמרת streak של 7 ימים', '🔥', 'streak >= 7'),
  ('חודש של חוכמה', 'שמרת streak של 30 ימים', '💎', 'streak >= 30'),
  ('אלוף ביאסים', 'השלמת 50 כרטיסי Think', '🧠', 'think_cards >= 50'),
  ('מנהל', 'הרווחת 100 XP ב-עסקים', '💼', 'business_xp >= 100'),
  ('חברים טובים', 'הוספת 3 חברים', '👥', 'friends >= 3');

-- Row Level Security
alter table public.users enable row level security;
alter table public.progress enable row level security;
alter table public.card_history enable row level security;
alter table public.friends enable row level security;
alter table public.user_badges enable row level security;
alter table public.notifications enable row level security;
alter table public.cards enable row level security;

-- RLS policies
create policy "users: own row" on public.users for all using (auth.uid() = id);
create policy "users: read all" on public.users for select using (true);
create policy "progress: own rows" on public.progress for all using (auth.uid() = user_id);
create policy "progress: read all" on public.progress for select using (true);
create policy "card_history: own rows" on public.card_history for all using (auth.uid() = user_id);
create policy "friends: own rows" on public.friends for all using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "user_badges: own rows" on public.user_badges for all using (auth.uid() = user_id);
create policy "user_badges: read all" on public.user_badges for select using (true);
create policy "notifications: own rows" on public.notifications for all using (auth.uid() = user_id);
create policy "cards: read approved" on public.cards for select using (status = 'approved');
