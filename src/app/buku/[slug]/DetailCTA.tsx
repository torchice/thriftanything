'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';

interface Book {
  slug: string;
  title: string;
  edition: 'original' | 'non_original';
  price: number;
  sold: boolean;
}

export function DetailCTA({ book }: { book: Book }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (book.sold) {
    return (
      <div className="mt-8 border border-edge bg-tint-clay p-4">
        <p className="font-display text-lg text-ink">Eksemplar ini sudah terjual</p>
        <p className="mt-1 text-sm text-body">
          Tidak ada restock untuk judul ini. Chat kami kalau mau dicarikan yang serupa.
        </p>
        <a
          href="https://wa.me/6281216530559"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-[44px] items-center border border-forest px-5 text-base text-forest no-underline transition-colors hover:bg-forest hover:text-paper"
        >
          Tanya stok serupa
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        aria-live="polite"
        onClick={() => {
          addItem({
            slug: book.slug,
            title: book.title,
            edition: book.edition,
            price: book.price
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className={`min-h-[52px] flex-1 border px-6 font-display text-lg transition-colors ${
          added
            ? 'border-forest bg-tint-green text-forest-deep'
            : 'border-forest bg-forest text-paper hover:bg-forest-deep'
        }`}
      >
        {added ? 'Masuk keranjang' : 'Tambah ke keranjang'}
      </button>
      <a
        href="https://wa.me/6281216530559"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[52px] flex-1 items-center justify-center border border-edge px-6 text-base text-body no-underline transition-colors hover:border-forest hover:text-forest-deep"
      >
        Tanya via WhatsApp
      </a>
    </div>
  );
}
