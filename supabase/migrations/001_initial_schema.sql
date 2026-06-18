-- services: master catalog of streaming services
create table services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo_url      text,
  plan_name     text,
  monthly_price numeric(6,2) not null,
  value_score   numeric(4,2),
  created_at    timestamptz default now()
);

-- user_subscriptions: subscriptions a user is tracking
create table user_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  service_id    uuid not null references services(id) on delete cascade,
  monthly_cost  numeric(6,2) not null,
  renewal_date  date,
  created_at    timestamptz default now()
);

-- titles: synced from TMDB
create table titles (
  id        uuid primary key default gen_random_uuid(),
  tmdb_id   integer not null unique,
  name      text not null,
  type      text not null check (type in ('movie', 'show')),
  genre_ids integer[]
);

-- title_availability: which titles are on which services by region
create table title_availability (
  id         uuid primary key default gen_random_uuid(),
  title_id   uuid not null references titles(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  region     text not null default 'US',
  unique (title_id, service_id, region)
);

-- watch_log: self-reported viewing history
create table watch_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title_id   uuid not null references titles(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  watched_at timestamptz default now(),
  source     text not null check (source in ('manual', 'csv_import'))
);

-- Row Level Security
alter table user_subscriptions enable row level security;
alter table watch_log enable row level security;

create policy "users can manage their own subscriptions"
  on user_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can manage their own watch log"
  on watch_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- services and titles are public read
alter table services enable row level security;
alter table titles enable row level security;
alter table title_availability enable row level security;

create policy "services are publicly readable"
  on services for select using (true);

create policy "titles are publicly readable"
  on titles for select using (true);

create policy "title_availability is publicly readable"
  on title_availability for select using (true);
