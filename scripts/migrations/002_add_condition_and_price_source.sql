-- Condition grade per copy, so the catalog can show a real badge instead of a guessed one.
-- Nullable on purpose: an ungraded book renders no badge.
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS condition text,
  ADD COLUMN IF NOT EXISTS original_price_source text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_condition_check') THEN
    ALTER TABLE books
      ADD CONSTRAINT books_condition_check
      CHECK (condition IN ('like_new', 'very_good', 'good'));
  END IF;
END $$;

COMMENT ON COLUMN books.condition IS
  'like_new = no visible wear, very_good = light shelf wear, good = readable with visible wear. NULL = not graded yet.';
COMMENT ON COLUMN books.original_price_source IS
  'URL of the retailer listing that original_price was read from. NULL means original_price must not be shown.';
