/*
  Writes data/books.csv from the database. The database is the source of truth:
  prices are edited in the admin panel, so the CSV is a snapshot, never an input
  that can overwrite a live value.

  Run: set -a && . ./.env.local && set +a && node scripts/export-books-csv.mjs
*/
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COLUMNS = [
  'slug', 'title', 'author', 'language', 'edition', 'condition',
  'price', 'original_price', 'original_price_source', 'sold', 'description', 'photo_url'
];

const cell = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const { data, error } = await db.from('books').select('*').order('slug');
if (error) {
  console.error(`Export failed: ${error.message}`);
  process.exit(1);
}

const lines = [COLUMNS.join(',')];
for (const row of data) lines.push(COLUMNS.map((c) => cell(row[c])).join(','));
fs.writeFileSync('data/books.csv', lines.join('\n') + '\n');

console.log(`Wrote data/books.csv from the database, ${data.length} rows.`);
