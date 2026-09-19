import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  try {
    const csvPath = path.join(__dirname, '../data/books.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Seeding ${records.length} books...`);

    for (const book of records) {
      const { error } = await client
        .from('books')
        .upsert({
          slug: book.slug,
          title: book.title,
          author: book.author || null,
          language: book.language,
          edition: book.edition,
          price: parseInt(book.price, 10),
          description: book.description,
          photo_url: `https://yvietoutodkdrjgzevow.supabase.co/storage/v1/object/public/book-photos/${book.photo.replace('.jpg', '.webp')}`,
          sold: false
        }, { onConflict: 'slug' });

      if (error) {
        console.error(`✗ ${book.title}: ${error.message}`);
      } else {
        console.log(`✓ ${book.title} (Rp${book.price} - ${book.edition})`);
      }
    }

    console.log('\n✓ Seeding complete.');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
