import { Suspense } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { BookCard, type BookCardData } from '@/components/BookCard';

export const revalidate = 60;

const WA = 'https://wa.me/6281216530559';

async function getBooks() {
  const supabase = createClient();
  return supabase
    .from('books')
    .select('*')
    .order('sold', { ascending: true })
    .order('created_at', { ascending: false });
}

/* R-27: empty, loading and error each say what happened and what to do next. */
function GridNotice({
  heading,
  children
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-rule bg-tan px-6 py-14 text-center">
      <p className="font-display text-xl text-ink">{heading}</p>
      <p className="mx-auto mt-2 max-w-prose text-sm text-body">{children}</p>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="card-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-rule bg-tan">
          <div className="aspect-[2/3] animate-pulse bg-[#E6DAC4]" />
          <div className="p-4">
            <p className="text-sm text-body">Memuat katalog...</p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function BooksGrid() {
  const { data: books, error } = await getBooks();

  if (error) {
    return (
      <GridNotice heading="Katalog gagal dimuat">
        Koneksi ke database putus. Muat ulang halaman ini, atau chat kami di WhatsApp{' '}
        <a href={WA} target="_blank" rel="noopener noreferrer">
          081216530559
        </a>{' '}
        dan kami kirim daftar stok terbaru.
      </GridNotice>
    );
  }

  if (!books || books.length === 0) {
    return (
      <GridNotice heading="Rak sedang kosong">
        Semua buku sudah terjual dan batch berikutnya belum difoto. Chat kami di{' '}
        <a href={WA} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>{' '}
        untuk dikabari duluan waktu rak diisi lagi.
      </GridNotice>
    );
  }

  const available = books.filter((b: BookCardData) => !b.sold).length;

  return (
    <>
      <p className="mb-6 text-sm text-body">
        {available} dari {books.length} judul masih tersedia. Setiap judul hanya satu
        eksemplar.
      </p>
      <div className="card-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {books.map((book: BookCardData) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>
    </>
  );
}

async function HeroCovers() {
  const { data } = await getBooks();
  const covers = (data || []).filter((b: BookCardData) => !b.sold).slice(0, 3);
  if (covers.length < 3) return null;

  return (
    <div className="flex items-end justify-center gap-0 md:justify-end">
      {covers.map((book: BookCardData, i: number) => (
        <div
          key={book.slug}
          className="relative h-[190px] w-[125px] border border-edge bg-[#E6DAC4] shadow-[0_1px_0_0_rgba(27,23,18,0.18)] md:h-[290px] md:w-[192px]"
          style={{
            transform: `rotate(${(i - 1) * 3}deg) translateY(${Math.abs(i - 1) * 10}px)`,
            marginLeft: i === 0 ? 0 : '-14px',
            zIndex: i === 1 ? 2 : 1
          }}
        >
          <Image
            src={book.photo_url}
            alt=""
            fill
            sizes="192px"
            priority={i === 1}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero: text column and a stack of three covers that are actual stock, not art. */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:px-8 md:py-24">
          <div>
            <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
              Buku bekas yang layak dibaca lagi, harga yang masuk akal.
            </h1>
            <p className="mt-4 max-w-prose text-base text-body md:mt-5 md:text-lg">
              Kami foto sendiri tiap buku, tulis kondisinya apa adanya, lalu kirim ke
              depan pintu Anda. Satu eksemplar per judul, jadi kalau habis ya habis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#katalog"
                className="inline-flex min-h-[48px] items-center bg-forest px-6 font-display text-lg text-paper no-underline transition-colors hover:bg-forest-deep"
              >
                Lihat katalog
              </a>
              <a
                href="#cara-pesan"
                className="inline-flex min-h-[48px] items-center border border-edge px-6 text-base text-body no-underline transition-colors hover:border-forest hover:text-forest-deep"
              >
                Cara pesannya
              </a>
            </div>
          </div>

          <Suspense fallback={null}>
            <HeroCovers />
          </Suspense>
        </div>
      </section>

      {/*
        Rhythm break 1: a thin band of three facts about how this shop actually runs.
        Statements, not statistics. Nothing here is a number we cannot back up.
      */}
      <section className="border-b border-rule bg-tan">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-3 md:gap-10 md:px-8 md:py-10">
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Foto di listing adalah bukunya
            </h2>
            <p className="mt-1 text-sm text-body">
              Bukan foto stok penerbit. Lecet dan noda yang terlihat, itu yang Anda terima.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Satu eksemplar per judul
            </h2>
            <p className="mt-1 text-sm text-body">
              Tidak ada restock. Judul yang terjual ditandai TERJUAL dan tidak bisa
              dimasukkan ke keranjang.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Surabaya diutamakan, Gojek Instant
            </h2>
            <p className="mt-1 text-sm text-body">
              Pesan pagi, bisa sampai siang. Luar Surabaya tetap dikirim, ongkir
              dikonfirmasi lewat WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="katalog" className="scroll-mt-20 border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Katalog</h2>
          <p className="mb-8 mt-2 max-w-prose text-base text-body">
            Diurutkan dari yang paling baru masuk rak. Yang sudah terjual tetap
            ditampilkan supaya jelas apa yang pernah ada.
          </p>
          <Suspense fallback={<GridSkeleton />}>
            <BooksGrid />
          </Suspense>
        </div>
      </section>

      {/*
        Three steps because the order flow genuinely has three moves, and the third
        one leaves the site. Laid out as a row of rules, not numbered circle icons.
      */}
      <section id="cara-pesan" className="scroll-mt-20 border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Cara pesan</h2>
          <p className="mb-10 mt-2 max-w-prose text-base text-body">
            Tidak ada akun, tidak ada payment gateway. Pesanan diselesaikan di WhatsApp
            supaya ongkir dan ketersediaan bisa dikonfirmasi orang, bukan sistem.
          </p>

          <ol className="grid gap-px border border-rule bg-rule md:grid-cols-3">
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">01</span>
              <h3 className="mt-3 font-display text-xl text-ink">
                Masukkan buku ke keranjang
              </h3>
              <p className="mt-2 text-sm text-body">
                Keranjang disimpan di browser Anda sendiri. Kami belum melihat apa pun
                di tahap ini.
              </p>
            </li>
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">02</span>
              <h3 className="mt-3 font-display text-xl text-ink">
                Isi nama, alamat, nomor WhatsApp
              </h3>
              <p className="mt-2 text-sm text-body">
                Dipakai untuk menghitung ongkir dan menulis label kirim. Tidak disimpan
                di server kami.
              </p>
            </li>
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">03</span>
              <h3 className="mt-3 font-display text-xl text-ink">
                Kirim pesanan lewat WhatsApp
              </h3>
              <p className="mt-2 text-sm text-body">
                Tombolnya membuka chat berisi ringkasan pesanan Anda. Kami balas dengan
                total ongkir dan cara bayar.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/*
        Rhythm break 2: the only full-bleed colour block on the page. It is the eco
        statement, which is the one idea that deserves to interrupt the paper ground.
      */}
      <section className="bg-forest text-paper">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-prose">
            <h2 className="font-display text-3xl text-paper md:text-4xl">
              Buku kedua tangan tetap buku utuh.
            </h2>
            <p className="mt-5 text-base text-paper/90 md:text-lg">
              Setiap judul di rak ini sudah selesai dibaca orang lain dan masih punya
              cerita yang sama lengkapnya. Menjualnya kembali lebih masuk akal daripada
              menumpuknya di gudang atau membuangnya, dan itu alasan toko ini ada.
            </p>
            <p className="mt-4 text-base text-paper/90">
              Kami tidak memajang angka penghematan karbon, karena kami tidak punya cara
              jujur untuk mengukurnya. Yang bisa kami janjikan: buku yang sampai ke Anda
              adalah buku yang sudah ada, bukan cetakan baru.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ: three questions we actually get on WhatsApp. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Tanya jawab</h2>
          <dl className="mt-10 max-w-prose divide-y divide-rule border-y border-rule">
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Apakah semua buku original?
              </dt>
              <dd className="mt-2 text-base text-body">
                Tidak. Tiap listing menyebutkan Original atau Non-original secara terbuka,
                dan harganya mengikuti. Fotonya buku yang benar-benar dikirim.
              </dd>
            </div>
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Bagaimana kalau buku keburu terjual saat saya checkout?
              </dt>
              <dd className="mt-2 text-base text-body">
                Buku yang sudah terjual ditandai TERJUAL dan tombolnya hilang. Kalau
                statusnya berubah tepat saat Anda checkout, kami konfirmasi di WhatsApp
                sebelum Anda bayar apa pun.
              </dd>
            </div>
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Kalau rusak di jalan bagaimana?
              </dt>
              <dd className="mt-2 text-base text-body">
                Kirim foto ke WhatsApp. Kami tangani per kasus sesuai kondisi pengepakan,
                tidak ada form klaim.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="bg-tan">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <p className="font-display text-2xl text-ink">Buku Bekas</p>
          <p className="mt-1 max-w-prose text-sm text-body">
            Rak buku bekas di Surabaya. Pertanyaan soal stok, kondisi, atau ongkir
            paling cepat dijawab di WhatsApp.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <a href="#katalog">Katalog</a>
            <a href="#cara-pesan">Cara pesan</a>
            <a href={WA} target="_blank" rel="noopener noreferrer">
              WhatsApp 081216530559
            </a>
          </div>

          <p className="mt-10 border-t border-edge/40 pt-6 text-xs text-body">
            Pembayaran dan ongkir diselesaikan lewat WhatsApp. Situs ini tidak menyimpan
            data pembeli dan tidak memproses pembayaran.
          </p>
        </div>
      </footer>
    </main>
  );
}
