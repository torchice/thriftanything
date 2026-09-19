'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { EditionBadge } from './EditionBadge';
import { SoldStamp } from './SoldStamp';

function AddToCartButton({ book }: { book: Book }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      slug: book.slug,
      title: book.title,
      edition: book.edition,
      price: book.price
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full py-2 px-3 text-sm font-body transition-all ${
        added
          ? 'bg-rule text-muted'
          : 'bg-accent text-paper hover:opacity-80'
      }`}
    >
      {added ? '✓ Ditambahkan' : 'Tambah ke Keranjang'}
    </button>
  );
}

interface Book {
  slug: string;
  title: string;
  language: string;
  edition: 'original' | 'non_original';
  price: number;
  original_price?: number;
  photo_url: string;
  sold: boolean;
}

export function BookCard({ book }: { book: Book }) {
  const href = `/buku/${book.slug}`;

  return (
    <Link href={href}>
      <div className="group cursor-pointer">
        {/* Photo */}
        <div className="relative mb-4 bg-rule aspect-[2/3] overflow-hidden">
          <Image
            src={book.photo_url}
            alt={book.title}
            fill
            className={`object-cover transition-opacity ${book.sold ? 'opacity-20' : 'group-hover:opacity-90'}`}
          />
          {book.sold && <SoldStamp />}
        </div>

        {/* Border rule */}
        <div className="border-b border-rule mb-4" />

        {/* Metadata */}
        <div className="space-y-2">
          <h3 className="font-display text-lg leading-tight text-ink line-clamp-2">
            {book.title}
          </h3>

          <div className="flex items-center justify-between text-sm">
            <EditionBadge edition={book.edition} />
            <span className="text-xs text-muted">
              {book.language === 'id' ? 'ID' : 'EN'}
            </span>
          </div>

          <div className="space-y-1">
            {book.original_price && book.original_price > book.price && (
              <div className="text-sm text-muted line-through">
                Rp{book.original_price.toLocaleString('id-ID')}
              </div>
            )}
            <div className="font-display text-lg text-accent font-semibold">
              Rp{book.price.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-muted">Harga Exclude Ongkir</div>
          </div>

          {book.sold ? (
            <div className="text-sm text-muted">Sudah terjual</div>
          ) : (
            <AddToCartButton book={book} />
          )}
        </div>
      </div>
    </Link>
  );
}
