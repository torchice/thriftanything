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

  const handleAddToCart = () => {
    addItem({
      slug: book.slug,
      title: book.title,
      edition: book.edition,
      price: book.price
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (book.sold) {
    return (
      <div className="mt-12">
        <button
          disabled
          className="w-full py-4 px-6 bg-rule text-muted font-display text-lg cursor-not-allowed"
        >
          Sudah Terjual
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-3">
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 px-6 font-display text-lg transition-all ${
          added
            ? 'bg-rule text-muted'
            : 'bg-accent text-paper hover:opacity-80'
        }`}
      >
        {added ? '✓ Ditambahkan ke Keranjang' : 'Tambah ke Keranjang'}
      </button>
      <a
        href="https://wa.me/6281216530559"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-4 px-6 border border-accent text-accent text-center font-display text-lg hover:bg-accent/5 transition-colors"
      >
        Pesan Langsung via WhatsApp
      </a>
    </div>
  );
}
