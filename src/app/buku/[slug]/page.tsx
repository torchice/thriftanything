import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EditionBadge } from '@/components/EditionBadge';
import { DetailCTA } from './DetailCTA';

export const revalidate = 60;

interface Book {
  slug: string;
  title: string;
  author: string | null;
  language: string;
  edition: 'original' | 'non_original';
  price: number;
  original_price?: number;
  description: string;
  photo_url: string;
  sold: boolean;
}

async function getBook(slug: string) {
  const supabase = createClient();
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !book) {
    notFound();
  }

  return book as Book;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  return {
    title: book.title,
    description: book.description
  };
}

export default async function BookDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Breadcrumb */}
      <nav className="py-4 px-6 border-b border-rule text-sm text-muted">
        <Link href="/" className="text-accent hover:opacity-80">
          Katalog
        </Link>
        <span className="mx-2">/</span>
        <span>{book.title}</span>
      </nav>

      {/* Detail */}
      <section className="py-12 px-6 md:py-20 md:px-12">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Photo */}
          <div className="flex flex-col gap-6">
            <div className="bg-rule aspect-[2/3] relative">
              <Image
                src={book.photo_url}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-sm text-muted">
              Foto adalah buku asli yang dijual. Kondisi seperti terlihat.
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl mb-3 leading-tight">
                  {book.title}
                </h1>
                {book.author && (
                  <p className="text-lg text-muted font-body">
                    Oleh {book.author}
                  </p>
                )}
              </div>

              {/* Edition & Language */}
              <div className="border-y border-rule py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Edisi</span>
                  <EditionBadge edition={book.edition} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Bahasa</span>
                  <span className="font-body">
                    {book.language === 'id' ? 'Indonesia' : 'English'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="border-b border-rule pb-6">
                <div className="text-sm text-muted mb-2">Harga</div>
                {book.original_price && book.original_price > book.price && (
                  <div className="text-lg text-muted line-through mb-1">
                    Rp{book.original_price.toLocaleString('id-ID')}
                  </div>
                )}
                <div className="font-display text-4xl text-accent font-semibold">
                  Rp{book.price.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-muted mt-2">
                  Harga Exclude Ongkir
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="font-display text-lg">Tentang Buku</h2>
                <p className="text-base leading-relaxed text-muted">
                  {book.description}
                </p>
              </div>
            </div>

            {/* CTA */}
            <DetailCTA book={book} />
          </div>
        </div>
      </section>

      {/* Back */}
      <section className="py-12 px-6 border-t border-rule text-center">
        <Link
          href="/#catalog"
          className="inline-block px-6 py-2 text-accent font-display hover:opacity-80"
        >
          ← Kembali ke Katalog
        </Link>
      </section>
    </main>
  );
}
