/*
  Fills books.original_price + books.original_price_source.

  Convention: original_price is the retailer's NORMAL price for a new copy, i.e. the
  crossed-out figure where the shop runs a promo, not today's promo price. Looked up
  by hand on 19 September 2026; every row carries the page the number came from.
  A title with no listing anywhere keeps NULL and the site shows no comparison.

  FILLS BLANKS ONLY. A row that already carries an original_price is left alone,
  because the database is the source of truth and a value corrected there must not
  be rolled back to what this file happened to hold. Pass --overwrite to replace
  existing values on purpose.

  Run: set -a && . ./.env.local && set +a && node scripts/fill-original-prices.mjs
*/
import { createClient } from '@supabase/supabase-js';

const PP = 'https://www.periplus.com';
const GM = 'https://www.gramedia.com';

const PRICES = [
  // Imported English editions, Periplus
  ['the-ride-of-a-lifetime', 283000, `${PP}/p/9781787630475/the-ride-of-a-lifetime-lessons-in-creative-leadership-from-15-years-as-ceo-of-the-walt-disney-company`],
  ['steve-jobs', 357000, `${PP}/p/9780349140438/steve-jobs`],
  ['the-mountain-is-you', 470000, `${PP}/p/9781949759228/the-mountain-is-you`],
  ['angels-and-demons', 225000, `${PP}/p/9780552160896/angels-and-demons`],
  ['thinking-fast-and-slow', 408000, `${PP}/p/9780374533557/thinking-fast-and-slow`],
  ['the-7-habits-of-highly-effective-people', 398000, `${PP}/p/9781982137274/the-7-habits-of-highly-effective-people-30th-anniversary-edition`],
  ['how-to-win-friends-digital-age', 387000, `${PP}/p/9781451612592/how-to-win-friends-and-influence-people-in-the-digital-age`],
  ['thrivers', 395000, `${PP}/p/9780593085295/thrivers-the-surprising-reasons-why-some-kids-struggle-and-others-shine`],
  ['the-janus-stone', 193000, `${PP}/product/Search?filter_name=The+Janus+Stone`],
  ['find-your-why', 427000, `${PP}/product/Search?filter_name=Find+Your+Why+Sinek`],
  ['7-rules-of-power', 275000, `${PP}/product/Search?filter_name=7+Rules+of+Power+Pfeffer`],
  ['embrace-the-night', 179000, `${PP}/product/Search?filter_name=Embrace+the+Night+Karen+Chance`],
  ['how-to-close-a-deal-like-warren-buffett', 739000, `${PP}/product/Search?filter_name=How+to+Close+a+Deal+Like+Warren+Buffett`],
  ['sky-key-endgame', 208000, `${PP}/product/Search?filter_name=Sky+Key`],
  ['being-warren-buffett', 288000, `${PP}/product/Search?filter_name=9781742708904`],

  // Indonesian editions, Gramedia
  ['the-wealth-of-nations', 360000, `${GM}/search?q=The%20Wealth%20of%20Nations%20Adam%20Smith`],
  ['keajaiban-toko-kelontong-namiya', 139000, `${GM}/search?q=Keajaiban%20Toko%20Kelontong%20Namiya`],
  ['you-do-you', 128000, `${GM}/search?q=You%20Do%20You%20Fellexandro%20Ruby`],
  ['multi-bagger', 88000, `${GM}/search?q=Multi%20Bagger%20Rivan%20Kurniawan`],
  ['jago-kuasai-bahasa-mandarin', 63000, `${GM}/search?q=Jago%20Kuasai%20Bahasa%20Mandarin`],
  ['copy-writing', 59500, `${GM}/search?q=Copy%20Writing%20Asti%20Musman`],
  ['the-da-vinci-code', 199000, `${GM}/search?q=The%20Da%20Vinci%20Code%20Dan%20Brown`],
  ['chasing-unicorns', 150000, `${GM}/products/chasing-unicorns`],
  ['check-up-kepribadianmu', 44500, `${GM}/products/check-up-kepribadianmu`],
  ['crypto-trading-guide', 97000, `${GM}/products/crypto-trading-guide`],

  // Publisher's own listing, where no retailer carries it
  ['investasi-cerdas', 45000, 'https://gagasmedia.net/buku/investasi-cerdas/'],
  ['mens-guide-to-style', 60000, 'https://gagasmedia.net/buku/men-s-guide-to-style/'],
  ['mulai-mengerti', 120000, 'https://www.blibli.com/p/mulai-mengerti-edward-suhadi-ind/ps--BEM-13749-00429']
];

/*
  southtown (Rick Riordan, Tres Navarre series) has no Indonesian retail listing on
  Periplus or Gramedia, so it keeps original_price NULL and shows no comparison.
*/

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const overwrite = process.argv.includes('--overwrite');

for (const [slug, price, source] of PRICES) {
  let query = db
    .from('books')
    .update({ original_price: price, original_price_source: source })
    .eq('slug', slug);

  if (!overwrite) query = query.is('original_price', null);

  const { data, error } = await query.select('slug');
  if (error) {
    console.log(`FAIL ${slug}: ${error.message}`);
  } else if (data.length === 0) {
    console.log(`skip ${slug}  already set in the database`);
  } else {
    console.log(`ok   ${slug}  Rp${price.toLocaleString('id-ID')}`);
  }
}
