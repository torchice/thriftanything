-- Isi harga buku baru + sumbernya, HANYA untuk baris yang masih kosong.
-- Database adalah sumber kebenaran: nilai yang sudah ada tidak ditimpa.
-- Jalankan di Supabase Dashboard > SQL Editor.

-- 1. Pastikan kolomnya ada.
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS original_price integer,
  ADD COLUMN IF NOT EXISTS original_price_source text,
  ADD COLUMN IF NOT EXISTS condition text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_condition_check') THEN
    ALTER TABLE books
      ADD CONSTRAINT books_condition_check
      CHECK (condition IN ('like_new', 'very_good', 'good'));
  END IF;
END $$;

-- 2. Update harga. 28 judul.
UPDATE books AS b
SET original_price = v.original_price,
    original_price_source = v.source
FROM (VALUES
  ('the-ride-of-a-lifetime', 283000, 'https://www.periplus.com/p/9781787630475/the-ride-of-a-lifetime-lessons-in-creative-leadership-from-15-years-as-ceo-of-the-walt-disney-company'),
  ('steve-jobs', 357000, 'https://www.periplus.com/p/9780349140438/steve-jobs'),
  ('the-mountain-is-you', 470000, 'https://www.periplus.com/p/9781949759228/the-mountain-is-you'),
  ('angels-and-demons', 225000, 'https://www.periplus.com/p/9780552160896/angels-and-demons'),
  ('thinking-fast-and-slow', 408000, 'https://www.periplus.com/p/9780374533557/thinking-fast-and-slow'),
  ('the-7-habits-of-highly-effective-people', 398000, 'https://www.periplus.com/p/9781982137274/the-7-habits-of-highly-effective-people-30th-anniversary-edition'),
  ('how-to-win-friends-digital-age', 387000, 'https://www.periplus.com/p/9781451612592/how-to-win-friends-and-influence-people-in-the-digital-age'),
  ('thrivers', 395000, 'https://www.periplus.com/p/9780593085295/thrivers-the-surprising-reasons-why-some-kids-struggle-and-others-shine'),
  ('the-janus-stone', 193000, 'https://www.periplus.com/product/Search?filter_name=The+Janus+Stone'),
  ('find-your-why', 427000, 'https://www.periplus.com/product/Search?filter_name=Find+Your+Why+Sinek'),
  ('7-rules-of-power', 275000, 'https://www.periplus.com/product/Search?filter_name=7+Rules+of+Power+Pfeffer'),
  ('embrace-the-night', 179000, 'https://www.periplus.com/product/Search?filter_name=Embrace+the+Night+Karen+Chance'),
  ('how-to-close-a-deal-like-warren-buffett', 739000, 'https://www.periplus.com/product/Search?filter_name=How+to+Close+a+Deal+Like+Warren+Buffett'),
  ('sky-key-endgame', 208000, 'https://www.periplus.com/product/Search?filter_name=Sky+Key'),
  ('being-warren-buffett', 288000, 'https://www.periplus.com/product/Search?filter_name=9781742708904'),
  ('the-wealth-of-nations', 360000, 'https://www.gramedia.com/search?q=The%20Wealth%20of%20Nations%20Adam%20Smith'),
  ('keajaiban-toko-kelontong-namiya', 139000, 'https://www.gramedia.com/search?q=Keajaiban%20Toko%20Kelontong%20Namiya'),
  ('you-do-you', 128000, 'https://www.gramedia.com/search?q=You%20Do%20You%20Fellexandro%20Ruby'),
  ('multi-bagger', 88000, 'https://www.gramedia.com/search?q=Multi%20Bagger%20Rivan%20Kurniawan'),
  ('jago-kuasai-bahasa-mandarin', 63000, 'https://www.gramedia.com/search?q=Jago%20Kuasai%20Bahasa%20Mandarin'),
  ('copy-writing', 59500, 'https://www.gramedia.com/search?q=Copy%20Writing%20Asti%20Musman'),
  ('the-da-vinci-code', 199000, 'https://www.gramedia.com/search?q=The%20Da%20Vinci%20Code%20Dan%20Brown'),
  ('chasing-unicorns', 150000, 'https://www.gramedia.com/products/chasing-unicorns'),
  ('check-up-kepribadianmu', 44500, 'https://www.gramedia.com/products/check-up-kepribadianmu'),
  ('crypto-trading-guide', 97000, 'https://www.gramedia.com/products/crypto-trading-guide'),
  ('investasi-cerdas', 45000, 'https://gagasmedia.net/buku/investasi-cerdas/'),
  ('mens-guide-to-style', 60000, 'https://gagasmedia.net/buku/men-s-guide-to-style/'),
  ('mulai-mengerti', 120000, 'https://www.blibli.com/p/mulai-mengerti-edward-suhadi-ind/ps--BEM-13749-00429')
) AS v(slug, original_price, source)
WHERE b.slug = v.slug
  AND b.original_price IS NULL;

-- 3. Southtown tidak punya listing retail di Indonesia. Dibiarkan apa adanya di
--    sini supaya perintah ini tidak pernah menghapus nilai yang kamu isi sendiri.

-- 4. Cek hasilnya.
SELECT slug, price, original_price, original_price_source
FROM books
ORDER BY slug;
