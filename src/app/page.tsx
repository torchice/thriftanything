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
            <p className="text-sm text-body">Bentar, lagi ngambil datanya...</p>
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
      <GridNotice heading="Raknya gagal kebuka">
        Koneksi ke database putus. Coba refresh dulu, atau chat aku di{' '}
        <a href={WA} target="_blank" rel="noopener noreferrer">
          WhatsApp 081216530559
        </a>{' '}
        biar aku kirimin daftar stoknya langsung.
      </GridNotice>
    );
  }

  if (!books || books.length === 0) {
    return (
      <GridNotice heading="Raknya lagi kosong">
        Semuanya udah kejual dan batch baru belum sempet aku foto. Chat aku di{' '}
        <a href={WA} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>{' '}
        biar aku kabarin duluan pas raknya keisi lagi.
      </GridNotice>
    );
  }

  const available = books.filter((b: BookCardData) => !b.sold).length;

  return (
    <>
      <p className="mb-6 text-sm text-body">
        {available} dari {books.length} judul masih ada. Tiap judul cuma satu biji.
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
              Rak aku udah penuh, jadi sebagian aku lepas.
            </h1>
            <p className="mt-4 max-w-prose text-base text-body md:mt-5 md:text-lg">
              Semua di sini buku yang beneran aku punya dan aku foto sendiri. Satu
              judul cuma ada satu biji, kalau udah diambil orang ya udah. Kirim dari
              Surabaya, bisa nyampe hari itu juga.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#katalog"
                className="inline-flex min-h-[48px] items-center bg-forest px-6 font-display text-lg text-paper no-underline transition-colors hover:bg-forest-deep"
              >
                Lihat rak aku
              </a>
              <a
                href="#cara-pesan"
                className="inline-flex min-h-[48px] items-center border border-edge px-6 text-base text-body no-underline transition-colors hover:border-forest hover:text-forest-deep"
              >
                Cara belinya
              </a>
            </div>
          </div>

          <Suspense fallback={null}>
            <HeroCovers />
          </Suspense>
        </div>
      </section>

      {/*
        Rhythm break 1: a thin band of three facts about how this shelf actually runs.
        Statements, not statistics. Nothing here is a number we cannot back up.
      */}
      <section className="border-b border-rule bg-tan">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-3 md:gap-10 md:px-8 md:py-10">
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Fotonya buku yang aslinya
            </h2>
            <p className="mt-1 text-sm text-body">
              Bukan comot dari Google. Lecet, noda, bekas stiker harga, semua keliatan
              apa adanya.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Satu judul, satu biji
            </h2>
            <p className="mt-1 text-sm text-body">
              Gak ada restock. Yang udah kejual aku tandain LAKU dan gak bisa masuk
              keranjang lagi.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink display-sm">
              Surabaya duluan, Gojek Instant
            </h2>
            <p className="mt-1 text-sm text-body">
              Pesen pagi, siang bisa nyampe. Luar Surabaya tetep aku kirim, ongkirnya
              aku kabarin di WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="katalog" className="scroll-mt-20 border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Rak aku</h2>
          <p className="mb-8 mt-2 max-w-prose text-base text-body">
            Urutannya dari yang paling baru aku taro. Yang udah kejual tetep aku pajang
            biar kamu tau aja pernah ada.
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
          <h2 className="font-display text-3xl text-ink md:text-4xl">Cara belinya</h2>
          <p className="mb-10 mt-2 max-w-prose text-base text-body">
            Gak usah bikin akun, gak ada payment gateway. Semuanya kelar di WhatsApp
            biar ongkir sama stoknya aku cek sendiri, bukan sistem.
          </p>

          <ol className="grid gap-px border border-rule bg-rule md:grid-cols-3">
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">01</span>
              <h3 className="mt-3 min-h-[1.35em] font-display text-xl text-ink">
                Masukin ke keranjang
              </h3>
              <p className="mt-2 text-sm text-body">
                Keranjangnya nyimpen di browser kamu sendiri. Sampai sini aku belum
                liat apa-apa.
              </p>
            </li>
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">02</span>
              <h3 className="mt-3 min-h-[1.35em] font-display text-xl text-ink">
                Isi nama, alamat, nomor WA
              </h3>
              <p className="mt-2 text-sm text-body">
                Buat ngitung ongkir sama nulis label kirim. Gak aku simpen di server.
              </p>
            </li>
            <li className="bg-paper p-6 md:p-8">
              <span className="font-display text-4xl text-edge">03</span>
              <h3 className="mt-3 min-h-[1.35em] font-display text-xl text-ink">
                Kirim pesanannya ke WA aku
              </h3>
              <p className="mt-2 text-sm text-body">
                Tombolnya langsung buka chat yang udah keisi pesanan kamu. Nanti aku
                bales total ongkir sama cara bayarnya.
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
              Buku bekas ya tetep buku.
            </h2>
            <p className="mt-5 text-base text-paper/90 md:text-lg">
              Semua yang ada di rak ini udah selesai aku baca dan isinya masih sama
              lengkapnya. Daripada numpuk di kamar sampe berdebu, mending pindah ke
              kamu yang emang mau baca.
            </p>
            <p className="mt-4 text-base text-paper/90">
              Aku gak bakal pasang angka hemat karbon sekian kilo, soalnya aku gak
              punya cara ngitungnya. Yang bisa aku janjiin cuma satu: buku yang nyampe
              ke kamu itu buku yang udah ada, bukan cetakan baru.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ: three questions people actually send on WhatsApp. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Yang sering ditanyain
          </h2>
          <dl className="mt-10 max-w-prose divide-y divide-rule border-y border-rule">
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Semua bukunya ori?
              </dt>
              <dd className="mt-2 text-base text-body">
                Nggak. Tiap buku aku tulis apa adanya, Ori atau Bukan ori, dan harganya
                ngikut. Fotonya buku yang beneran bakal aku kirim.
              </dd>
            </div>
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Gimana kalau kejual pas aku lagi checkout?
              </dt>
              <dd className="mt-2 text-base text-body">
                Yang udah kejual aku tandain LAKU dan tombolnya ilang. Kalau pas banget
                berubah waktu kamu checkout, aku kabarin di WhatsApp sebelum kamu bayar
                apa-apa.
              </dd>
            </div>
            <div className="py-6">
              <dt className="font-display text-lg text-ink">
                Kalau rusak di jalan gimana?
              </dt>
              <dd className="mt-2 text-base text-body">
                Foto aja terus kirim ke WhatsApp. Aku urus satu-satu sesuai kondisi
                packingnya, gak pakai form klaim.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="bg-tan">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <p className="font-display text-2xl text-ink">Buku Bekas</p>
          <p className="mt-1 max-w-prose text-sm text-body">
            Ini rak buku pribadi aku di Surabaya, bukan toko. Mau nanya stok, kondisi,
            atau ongkir, paling cepet lewat WhatsApp.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <a href="#katalog">Rak buku</a>
            <a href="#cara-pesan">Cara beli</a>
            <a href={WA} target="_blank" rel="noopener noreferrer">
              WhatsApp 081216530559
            </a>
          </div>

          <p className="mt-10 border-t border-edge/40 pt-6 text-xs text-body">
            Bayar sama ongkir kelarnya di WhatsApp. Web ini gak nyimpen data kamu dan
            gak proses pembayaran.
          </p>
        </div>
      </footer>
    </main>
  );
}
