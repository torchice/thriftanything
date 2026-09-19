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
      <section className="py-12 px-6 md:py-24 md:px-12 border-b border-rule">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
            Buku bekas pilihan, satu eksemplar per judul.
          </h1>
          <p className="text-lg text-muted mb-2">
            Prioritize Surabaya Area Via Gojek Instant
          </p>
          <p className="text-sm text-muted mb-6">
            Kirim hari ini juga, ongkir dibayar di tempat.
          </p>
          <a
            href="#catalog"
            className="inline-block px-6 py-3 bg-accent text-paper font-display text-lg"
          >
            Lihat Katalog
          </a>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-12 px-4 md:py-20 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-8">Katalog</h2>
          <Suspense fallback={<div className="py-20 text-center text-muted">Memuat...</div>}>
            <BooksGrid />
          </Suspense>
        </div>
      </section>

      {/* Cara Pesan */}
      <section className="py-12 px-6 md:py-20 md:px-12 border-t border-rule">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-8">Cara Pesan</h2>
          <ol className="space-y-6 text-base leading-relaxed">
            <li>
              <span className="font-display text-lg text-accent">1.</span>
              <span className="ml-4">Pilih buku yang ingin dibeli, tambahkan ke keranjang.</span>
            </li>
            <li>
              <span className="font-display text-lg text-accent">2.</span>
              <span className="ml-4">Isi nama lengkap, alamat pengiriman, dan nomor WhatsApp.</span>
            </li>
            <li>
              <span className="font-display text-lg text-accent">3.</span>
              <span className="ml-4">Kirim pesanan ke WhatsApp. Admin akan konfirmasi total ongkir.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Pengiriman */}
      <section className="py-12 px-6 md:py-20 md:px-12 border-t border-rule">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-4">Pengiriman</h2>
          <p className="text-base text-accent font-semibold mb-4">
            Prioritize Surabaya Area Via Gojek Instant
          </p>
          <p className="text-base leading-relaxed text-muted">
            Luar Surabaya dikirim via JNE/J&T, ongkir menyusul setelah konfirmasi.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-6 md:py-20 md:px-12 border-t border-rule">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-8">Tanya Jawab</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg mb-2">Apakah semua buku original?</h3>
              <p className="text-sm text-muted">
                Tidak semua. Setiap listing jelas disebutkan edisi original atau non-original. Foto adalah asli buku yang dijual.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg mb-2">Bagaimana jika buku terjual?</h3>
              <p className="text-sm text-muted">
                Buku akan ditandai TERJUAL dan tidak bisa ditambah ke keranjang. Jika ada perubahan kondisi stok saat Anda checkout, kami akan konfirmasi di WhatsApp.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg mb-2">Ada garansi rusak di jalan?</h3>
              <p className="text-sm text-muted">
                Lapor di WhatsApp dengan foto. Kami handle case by case sesuai kondisi pengepakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-rule text-center text-sm text-muted">
        <p>Hubungi: <a href="https://wa.me/6281216530559" className="text-accent">wa.me/6281216530559</a></p>
      </footer>
    </main>
  );
}
