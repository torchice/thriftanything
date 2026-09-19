/*
  Add one book end to end: normalize the photo, upload it to Supabase Storage,
  and insert the row. The catalog page revalidates every 60s, so the book shows
  up on the site on its own once this finishes.

  Run:
    set -a && . ./.env.local && set +a && node scripts/add-book.mjs \
      --photo assets/raw/accounting.jpg \
      --title "Accounting" \
      --author "..." \
      --lang id \
      --edition original \
      --price 50000 \
      --desc "..."

  Optional: --condition like_new|very_good|good
            --original-price 120000 --source https://...
            --slug custom-slug
            --dry-run
*/
import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BUCKET = 'book-photos';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const args = parseArgs(process.argv.slice(2));
const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

// Required
for (const k of ['photo', 'title', 'lang', 'edition', 'price', 'desc']) {
  if (!args[k] || args[k] === true) fail(`--${k} is required.`);
}
if (!fs.existsSync(args.photo)) fail(`photo not found: ${args.photo}`);
if (!['id', 'en'].includes(args.lang)) fail("--lang must be 'id' or 'en'.");
if (!['original', 'non_original'].includes(args.edition)) {
  fail("--edition must be 'original' or 'non_original'.");
}
const price = Number(args.price);
if (!Number.isInteger(price) || price <= 0) fail('--price must be a positive integer.');

const originalPrice = args['original-price'] ? Number(args['original-price']) : null;
if (originalPrice !== null) {
  if (!Number.isInteger(originalPrice) || originalPrice <= 0) {
    fail('--original-price must be a positive integer.');
  }
  // C-5: a comparison price is only shown when its source is shown with it.
  if (!args.source || args.source === true) {
    fail('--original-price requires --source, the retailer URL it was read from.');
  }
}
if (args.condition && !['like_new', 'very_good', 'good'].includes(args.condition)) {
  fail("--condition must be 'like_new', 'very_good' or 'good'.");
}
// R-02: no em or en dashes in copy that ships.
for (const field of ['title', 'author', 'desc']) {
  if (typeof args[field] === 'string' && /[–—]/.test(args[field])) {
    fail(`--${field} contains an em or en dash. Use a comma, colon or period.`);
  }
}

const slug = args.slug && args.slug !== true ? slugify(args.slug) : slugify(args.title);
const webpName = `${slug}.webp`;
const webpPath = path.join('public/books', webpName);

// Same treatment the rest of the catalog got: trim, letterbox to 1000x1500, webp.
console.log(`Normalizing ${args.photo} -> ${webpPath}`);
if (!args['dry-run']) {
  const tmp = path.join(process.env.TMPDIR || '/tmp', `${slug}-trim.jpg`);
  execFileSync('convert', [args.photo, '-auto-level', '-trim', '+repage', tmp]);
  execFileSync('convert', [
    tmp, '-resize', '1000x1500', '-background', 'white', '-gravity', 'center',
    '-extent', '1000x1500', '-quality', '80', '-define', 'webp:lossless=false', webpPath
  ]);
  fs.rmSync(tmp, { force: true });
  console.log(`  ${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB`);
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: existing } = await db.from('books').select('slug').eq('slug', slug).maybeSingle();
if (existing) fail(`a book with slug "${slug}" already exists. Pass a different --slug.`);

if (args['dry-run']) {
  console.log('\nDry run, nothing written. Row would be:');
  console.log(JSON.stringify({
    slug, title: args.title, author: args.author || null, language: args.lang,
    edition: args.edition, price, description: args.desc,
    condition: args.condition || null,
    original_price: originalPrice, original_price_source: originalPrice ? args.source : null,
    photo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${webpName}`,
    sold: false
  }, null, 2));
  process.exit(0);
}

console.log(`Uploading ${webpName} to storage`);
const { error: upErr } = await db.storage
  .from(BUCKET)
  .upload(webpName, fs.readFileSync(webpPath), { upsert: true, contentType: 'image/webp' });
if (upErr) fail(`upload failed: ${upErr.message}`);

const photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${webpName}`;

const { error: insErr } = await db.from('books').insert({
  slug,
  title: args.title,
  author: args.author && args.author !== true ? args.author : null,
  language: args.lang,
  edition: args.edition,
  price,
  description: args.desc,
  condition: args.condition && args.condition !== true ? args.condition : null,
  original_price: originalPrice,
  original_price_source: originalPrice ? args.source : null,
  photo_url: photoUrl,
  sold: false
});
if (insErr) fail(`insert failed: ${insErr.message}`);

console.log(`\nAdded: ${args.title}`);
console.log(`  /buku/${slug}`);
console.log('  Live on the catalog within 60s (ISR revalidate).');
