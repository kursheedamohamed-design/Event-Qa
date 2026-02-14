
-- 📝 Supabase SQL Editor-ൽ ഇത് കോപ്പി ചെയ്ത് റൺ ചെയ്യുക.

-- 1. Create Vendors Table
create table vendors (
  id text primary key,
  name text not null,
  category text not null,
  description text,
  services text[],
  price text,
  price_type text,
  location text,
  whatsapp text,
  is_whatsapp_verified boolean default false,
  verified boolean default false,
  featured boolean default false,
  images text[],
  profile_photo text,
  keywords text[],
  status text default 'Pending',
  created_at bigint,
  profile_views int default 0,
  whatsapp_clicks int default 0,
  instagram text,
  facebook text,
  tiktok text,
  website text,
  menu jsonb default '[]'::jsonb
);

-- 2. Create Reviews Table
create table reviews (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  author_name text not null,
  rating int not null,
  comment text,
  created_at bigint
);

-- 3. Enable Public Access (Security can be hardened later)
alter table vendors enable row level security;
alter table reviews enable row level security;

create policy "Public Access" on vendors for select using (true);
create policy "Public Insert" on vendors for insert with check (true);
create policy "Public Update" on vendors for update using (true);

create policy "Public Access Reviews" on reviews for select using (true);
create policy "Public Insert Reviews" on reviews for insert with check (true);
