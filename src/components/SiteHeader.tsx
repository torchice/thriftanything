'use client';

import Link from 'next/link';

export function SiteHeader({
  cartCount,
  onOpenCart
}: {
  cartCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          className="no-underline focus-visible:outline-offset-4"
          aria-label="Buku Bekas, balik ke depan"
        >
          <span className="block font-display text-xl leading-none text-ink md:text-2xl">
            Buku Bekas
          </span>
          <span className="mt-1 block text-xs tracking-[0.14em] text-body">
            SURABAYA
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2" aria-label="Utama">
          <Link
            href="/#katalog"
            className="hidden px-3 py-2 text-sm text-body no-underline hover:text-forest-deep sm:inline-block"
          >
            Rak buku
          </Link>
          <Link
            href="/#cara-pesan"
            className="hidden px-3 py-2 text-sm text-body no-underline hover:text-forest-deep sm:inline-block"
          >
            Cara beli
          </Link>

          <button
            type="button"
            onClick={onOpenCart}
            className="ml-1 inline-flex min-h-[44px] items-center gap-2 border border-forest bg-forest px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-forest-deep"
          >
            Keranjang
            <span
              className="inline-flex h-5 min-w-[20px] items-center justify-center bg-paper px-1 text-xs font-bold text-forest-deep"
              aria-hidden="true"
            >
              {cartCount}
            </span>
            <span className="sr-only">
              {cartCount === 0 ? 'masih kosong' : `isinya ${cartCount} buku`}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
