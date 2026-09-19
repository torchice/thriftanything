import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookCard } from '@/components/BookCard';

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

async function BooksGrid() {
  const supabase = createClient();

  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('sold', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !books) {
    return (
      <div className="text-center py-20 col-span-full text-muted">
        Gagal memuat katalog. Coba lagi nanti.
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-20 col-span-full text-muted">
        Katalog kosong.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book: Book) => (
        <BookCard key={book.slug} book={book} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Hero */}
      <section className="py-16 px-6 md:py-32 md:px-12 border-b border-rule">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl mb-6 leading-tight">
            Buku bekas pilihan, satu eksemplar per judul.
          </h1>
          <p className="text-base md:text-lg text-muted mb-8 leading-relaxed">
            Koleksi buku bekas berkualitas di Surabaya. Kirim hari ini juga, ongkir dibayar di tempat.
          </p>
          <a
            href="#catalog"
            className="inline-block px-6 py-3 bg-accent text-paper font-display hover:opacity-80 transition-opacity"
          >
            Lihat Katalog
          </a>
        </div>
      </section>

      {/* Key phrase */}
      <section className="py-8 px-6 md:py-12 md:px-12 bg-rule/30 border-b border-rule">
        <div className="max-w-2xl">
          <p className="text-sm text-muted uppercase tracking-wider">Pengiriman</p>
          <p className="font-display text-lg md:text-xl mt-2">
            Prioritize Surabaya Area Via Gojek Instant
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-16 px-6 md:py-24 md:px-12 border-b border-rule">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl mb-12">Katalog</h2>
          <Suspense fallback={<div className="py-20 text-center text-muted">Memuat...</div>}>
            <BooksGrid />
          </Suspense>
        </div>
      </section>

      {/* Cara Pesan */}
      <section className="py-16 px-6 md:py-24 md:px-12 border-b border-rule">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl mb-12">Cara Pesan</h2>
          <ol className="space-y-8 text-base leading-relaxed">
            <li className="flex gap-4">
              <span className="font-display text-lg text-muted flex-shrink-0">1</span>
              <span>Pilih buku yang ingin dibeli, tambahkan ke keranjang.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-display text-lg text-muted flex-shrink-0">2</span>
              <span>Isi nama lengkap, alamat pengiriman, dan nomor WhatsApp.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-display text-lg text-muted flex-shrink-0">3</span>
              <span>Kirim pesanan ke WhatsApp. Admin akan konfirmasi total ongkir.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 md:py-24 md:px-12 border-b border-rule">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl mb-12">Tanya Jawab</h2>
          <div className="space-y-8 divide-y divide-rule">
            <div className="pt-0">
              <h3 className="font-display text-lg mb-3">Apakah semua buku original?</h3>
              <p className="text-base text-muted leading-relaxed">
                Tidak semua. Setiap listing jelas disebutkan edisi original atau non-original. Foto adalah asli buku yang dijual.
              </p>
            </div>
            <div className="pt-8">
              <h3 className="font-display text-lg mb-3">Bagaimana jika buku terjual?</h3>
              <p className="text-base text-muted leading-relaxed">
                Buku akan ditandai TERJUAL dan tidak bisa ditambah ke keranjang. Jika ada perubahan kondisi stok saat Anda checkout, kami akan konfirmasi di WhatsApp.
              </p>
            </div>
            <div className="pt-8">
              <h3 className="font-display text-lg mb-3">Ada garansi rusak di jalan?</h3>
              <p className="text-base text-muted leading-relaxed">
                Lapor di WhatsApp dengan foto. Kami handle case by case sesuai kondisi pengepakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:py-16 md:px-12 border-t border-rule">
        <div className="max-w-2xl">
          <p className="text-sm text-muted mb-4">Punya pertanyaan? Hubungi kami</p>
          <a
            href="https://wa.me/6281216530559"
            className="inline-block px-6 py-3 border border-accent text-accent font-display text-base hover:bg-accent hover:text-paper transition-colors"
          >
            Chat di WhatsApp
          </a>
        </div>
      </footer>
    </main>
  );
}
