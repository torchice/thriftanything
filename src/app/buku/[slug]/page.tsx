import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EditionBadge } from '@/components/EditionBadge';
import { ConditionBadge, type BookCondition } from '@/components/ConditionBadge';
import { Tag } from '@/components/Tag';
import { DetailCTA } from './DetailCTA';

export const revalidate = 60;

interface Book {
  slug: string;
  title: string;
  author: string | null;
  language: string;
  edition: 'original' | 'non_original';
  condition?: BookCondition | null;
  price: number;
  original_price?: number | null;
  original_price_source?: string | null;
  description: string;
  photo_url: string;
  sold: boolean;
}

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

async function getBook(slug: string) {
  const supabase = createClient();
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !book) notFound();
  return book as Book;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  return { title: book.title, description: book.description };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-body">{label}</dt>
      <dd className="text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function BookDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  const ref =
    typeof book.original_price === 'number' && book.original_price > book.price
      ? book.original_price
      : null;
  // Only an original edition can honestly claim a discount off the retail copy.
  const isSameEdition = book.edition === 'original';

  return (
    <main>
      <nav
        aria-label="Jalur halaman"
        className="border-b border-rule bg-tan px-5 py-3 text-sm md:px-8"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link href="/#katalog">Rak buku</Link>
          <span aria-hidden="true" className="text-edge">
            /
          </span>
          <span className="truncate text-body">{book.title}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-14">
          <div>
            <div className="relative aspect-[2/3] border border-edge bg-[#E6DAC4]">
              <Image
                src={book.photo_url}
                alt={`Sampul ${book.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className={`object-cover ${book.sold ? 'opacity-40' : ''}`}
                priority
              />
            </div>
            <p className="mt-3 text-sm text-body">
              Ini foto buku yang bakal aku kirim, bukan foto stok penerbit. Kondisinya
              ya kayak yang keliatan.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <ConditionBadge condition={book.condition} />
              <EditionBadge edition={book.edition} />
              {book.sold && <Tag tone="clay">Udah laku</Tag>}
            </div>

            <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              {book.title}
            </h1>
            {book.author && (
              <p className="mt-2 text-lg text-body">{book.author}</p>
            )}

            <div className="mt-7 border-y border-rule">
              <dl className="divide-y divide-rule">
                <Row label="Bahasa">
                  {book.language === 'id' ? 'Indonesia' : 'Inggris'}
                </Row>
                <Row label="Edisi">
                  {book.edition === 'original' ? 'Ori' : 'Bukan ori'}
                </Row>
                <Row label="Stok">
                  {book.sold ? 'Udah laku' : '1 biji'}
                </Row>
              </dl>
            </div>

            <div className="mt-7">
              {ref && isSameEdition && (
                <p className="text-base text-clay">
                  <span className="line-through">{rupiah(ref)}</span>
                  <span className="ml-2 text-sm">harga barunya</span>
                </p>
              )}
              <p className="font-display text-4xl font-semibold text-ink md:text-5xl">
                {rupiah(book.price)}
              </p>
              <p className="mt-1 text-sm text-body">
                Belum ongkir. Ongkirnya aku kabarin di WhatsApp begitu alamat kamu
                masuk.
              </p>

              {/* C-5: the comparison price is only shown with the listing it came from. */}
              {ref && (
                <p className="mt-3 border-l-2 border-edge pl-3 text-sm text-body">
                  {isSameEdition
                    ? 'Yang baru judul ini dijual '
                    : 'Yang ini bukan edisi resmi. Edisi resminya kalau beli baru '}
                  {rupiah(ref)}
                  {book.original_price_source && (
                    <>
                      {' '}
                      <a
                        href={book.original_price_source}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        cek sendiri
                      </a>
                    </>
                  )}
                  . Aku cek 19 September 2026.
                </p>
              )}
            </div>

            <DetailCTA book={book} />

            <div className="mt-10">
              <h2 className="font-display text-xl text-ink">Isinya tentang apa</h2>
              <p className="mt-3 max-w-prose text-base text-body">
                {book.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-rule bg-tan">
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
          <Link href="/#katalog" className="font-display text-lg">
            Balik ke rak
          </Link>
        </div>
      </div>
    </main>
  );
}
