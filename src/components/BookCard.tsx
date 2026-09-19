'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { EditionBadge } from './EditionBadge';
import { ConditionBadge, type BookCondition } from './ConditionBadge';
import { SoldStamp } from './SoldStamp';
import { Tag } from './Tag';

export interface BookCardData {
  slug: string;
  title: string;
  author?: string | null;
  language: string;
  edition: 'original' | 'non_original';
  condition?: BookCondition | null;
  price: number;
  original_price?: number | null;
  photo_url: string;
  sold: boolean;
}

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

function AddToCartButton({ book }: { book: BookCardData }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
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
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={`min-h-[44px] w-full px-3 text-sm font-medium transition-colors ${
        added
          ? 'border border-forest bg-tint-green text-forest-deep'
          : 'border border-forest bg-forest text-paper hover:bg-forest-deep'
      }`}
    >
      {added ? 'Udah masuk' : 'Masukin keranjang'}
    </button>
  );
}

export function BookCard({ book }: { book: BookCardData }) {
  const href = `/buku/${book.slug}`;
  const ref = typeof book.original_price === 'number' && book.original_price > book.price
    ? book.original_price
    : null;
  /*
    The percentage is only honest for an original edition, where the new copy at
    the retailer is the same book. A non-original copy is a different object, so
    it gets the retail figure as a plain reference and no discount claim.
  */
  const isSameEdition = book.edition === 'original';
  const cut = ref && isSameEdition
    ? Math.round(((ref - book.price) / ref) * 100)
    : 0;

  return (
    <article className="group flex h-full flex-col border border-rule bg-tan transition-colors duration-150 hover:border-edge">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[2/3] overflow-hidden bg-[#E6DAC4] no-underline"
      >
        <Image
          src={book.photo_url}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-200 ${
            book.sold ? 'opacity-35' : 'group-hover:scale-[1.03]'
          }`}
        />
        {book.sold && <SoldStamp />}
        {!book.sold && cut > 0 && (
          <span className="absolute left-0 top-0 bg-clay px-2 py-1 text-xs font-bold text-paper">
            {cut}% lebih murah
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        {/* Fixed-height tag row so cards with and without a condition grade line up. */}
        <div className="flex min-h-[22px] flex-wrap items-start gap-1.5">
          <ConditionBadge condition={book.condition} />
          <EditionBadge edition={book.edition} />
        </div>

        {/* Title box is locked to two lines: a 2-line title must not push the price down. */}
        <h3 className="mt-2 min-h-[2.5em] font-display text-lg leading-[1.25] text-ink line-clamp-2 display-sm">
          <Link href={href} className="text-ink no-underline hover:text-forest-deep">
            {book.title}
          </Link>
        </h3>

        <p className="mt-1 min-h-[1.5em] truncate text-sm text-body">
          {book.author || ''}
        </p>

        {/* Price and action are pinned to the bottom edge of every card. */}
        <div className="mt-auto pt-3">
          {ref && isSameEdition && (
            <p className="text-sm text-clay line-through decoration-clay/60">
              {rupiah(ref)}
            </p>
          )}
          <p className="font-display text-xl font-semibold text-ink">
            {rupiah(book.price)}
          </p>
          <p className="mb-3 text-xs text-body">
            {ref && !isSameEdition
              ? `Yang ori barunya ${rupiah(ref)}. Belum ongkir`
              : 'Belum ongkir'}
          </p>

          {book.sold ? (
            <div className="flex min-h-[44px] items-center">
              <Tag tone="clay">Udah laku</Tag>
            </div>
          ) : (
            <AddToCartButton book={book} />
          )}
        </div>
      </div>
    </article>
  );
}
