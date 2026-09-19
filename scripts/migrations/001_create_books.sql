-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  author text,
  description text not null,
  language text not null,
  price integer not null,
  edition text not null check (edition in ('original', 'non_original')),
  photo_url text not null,
  sold boolean default false,
  sold_at timestamptz,
  created_at timestamptz default now()
);

-- Create index on sold for fast filtering
CREATE INDEX idx_books_sold ON books(sold);
CREATE INDEX idx_books_created ON books(created_at desc);
CREATE INDEX idx_books_slug ON books(slug);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Public can select all books (including sold)
CREATE POLICY "Public select" ON books
  FOR SELECT
  USING (true);

-- Only admin can update/insert/delete (via service role in app code)
-- No public policies for write operations

-- Create book-photos storage bucket
-- (Do this via Supabase dashboard: Storage > Create new bucket > book-photos > make public)
