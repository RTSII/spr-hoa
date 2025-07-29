-- Supabase table for News Section posts
create table if not exists news_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null, -- rich text (HTML or markdown)
  author_id uuid references owner_profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  tags text[],
  is_published boolean default true,
  search_vector tsvector
);

-- For full-text search
create index if not exists news_posts_search_idx on news_posts using gin(search_vector);
create trigger news_posts_vector_update before insert or update
on news_posts for each row execute procedure
tsvector_update_trigger(
  search_vector, 'pg_catalog.english', title, body, tags
);
