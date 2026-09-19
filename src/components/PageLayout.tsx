'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { CartDrawer } from './CartDrawer';
import { SiteHeader } from './SiteHeader';

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();

  return (
    <>
      <SiteHeader cartCount={items.length} onOpenCart={() => setCartOpen(true)} />

      <div id="konten" className={items.length > 0 ? 'pb-24 md:pb-0' : undefined}>
        {children}
      </div>

      {/*
        Mobile only, and only once the cart has something in it: an always-present
        floating button on an empty cart is a control with nothing behind it.
      */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-edge bg-tan px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex min-h-[48px] w-full items-center justify-between bg-forest px-5 text-paper transition-colors hover:bg-forest-deep"
          >
            <span className="text-sm font-medium">
              {items.length} buku di keranjang
            </span>
            <span className="font-display text-lg">Cek</span>
          </button>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
