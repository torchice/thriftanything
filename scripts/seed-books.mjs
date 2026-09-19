/*
  Inserts books from data/books.csv that are not in the database yet.

  INSERT ONLY. This never updates an existing row. Prices, sold flags and
  descriptions are edited in the admin panel and in Supabase, so the database
  outranks this file; an upsert here would silently roll a corrected price back
  to whatever the CSV happened to hold.

  To refresh the CSV from the database instead, run scripts/export-books-csv.mjs.

  Run: set -a && . ./.env.local && set +a && node scripts/seed-books.mjs [--dry-run]
*/
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const dryRun = process.argv.includes('--dry-run');

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const records = parse(fs.readFileSync('data/books.csv', 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

const { data: existingRows, error: readErr } = await db.from('books').select('slug');
if (readErr) {
  console.error(`Could not read existing books: ${readErr.message}`);
  process.exit(1);
}
const existing = new Set(existingRows.map((r) => r.slug));

const toInsert = records.filter((r) => !existing.has(r.slug));
const skipped = records.length - toInsert.length;

console.log(`${records.length} rows in CSV, ${skipped} already in the database, ${toInsert.length} to insert.`);
if (skipped > 0) {
  console.log('Skipped rows are left exactly as they are in the database.');
}
if (toInsert.length === 0) process.exit(0);

if (dryRun) {
  toInsert.forEach((r) => console.log(`  would insert ${r.slug}`));
  process.exit(0);
}

for (const r of toInsert) {
  const { error } = await db.from('books').insert({
    slug: r.slug,
    title: r.title,
    author: r.author || null,
    language: r.language,
    edition: r.edition,
    condition: r.condition || null,
    price: parseInt(r.price, 10),
    original_price: r.original_price ? parseInt(r.original_price, 10) : null,
    original_price_source: r.original_price_source || null,
    description: r.description,
    photo_url: r.photo_url,
    sold: r.sold === 'true'
  });
  console.log(error ? `FAIL ${r.slug}: ${error.message}` : `inserted ${r.slug}`);
}
