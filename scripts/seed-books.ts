import { createAdminClient } from '../src/lib/supabase/admin';
import * as fs from 'fs';
import * as path from 'path';

const adminClient = createAdminClient();

interface BookRow {
  slug: string;
  title: string;
  author: string;
  language: string;
  edition: 'original' | 'non_original';
  price: number;
  description: string;
  photo: string;
}

async function parseCSV(filePath: string): Promise<BookRow[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || null;
    });
    return {
      slug: obj.slug,
      title: obj.title,
      author: obj.author || null,
      language: obj.language,
      edition: obj.edition as 'original' | 'non_original',
      price: parseInt(obj.price, 10),
      description: obj.description,
      photo: obj.photo
    };
  });
}

async function seed() {
  try {
    const booksData = await parseCSV(path.join(__dirname, '../data/books.csv'));

    console.log(`Seeding ${booksData.length} books...`);

    for (const book of booksData) {
      const { error } = await adminClient
        .from('books')
        .upsert(
          {
            slug: book.slug,
            title: book.title,
            author: book.author,
            language: book.language,
            edition: book.edition,
            price: book.price,
            description: book.description,
            photo_url: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('https://', '')}/storage/v1/object/public/book-photos/${book.slug}.webp`,
            sold: false
          },
          { onConflict: 'slug' }
        );

      if (error) {
        console.error(`Error seeding ${book.slug}:`, error.message);
      } else {
        console.log(`✓ ${book.title}`);
      }
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
