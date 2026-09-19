'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EditionBadge } from './EditionBadge';
import { SoldStamp } from './SoldStamp';

interface Book {
  slug: string;
  title: string;
  language: string;
  edition: 'original' | 'non_original';
  price: number;
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

          <div className="font-display text-lg text-accent font-semibold">
            Rp{book.price.toLocaleString('id-ID')}
          </div>

          {book.sold ? (
            <div className="text-sm text-muted">Sudah terjual</div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: add to cart
              }}
              className="w-full py-2 px-3 bg-accent text-paper text-sm font-body hover:opacity-80 transition-opacity"
            >
              Tambah ke Keranjang
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
