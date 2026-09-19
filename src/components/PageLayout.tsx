'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { CartDrawer } from './CartDrawer';

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();

  return (
    <>
      {children}

      {/* Cart FAB (sticky button on mobile) */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 md:hidden z-30 w-16 h-16 bg-accent text-paper rounded-full flex items-center justify-center font-display text-sm hover:opacity-80 transition-opacity shadow-lg"
      >
        <span className="text-center">
          <div>{items.length}</div>
          <div className="text-xs">Keranjang</div>
        </span>
      </button>

      {/* Desktop cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className="hidden md:fixed md:top-6 md:right-6 z-30 md:flex items-center gap-2 px-4 py-3 bg-accent text-paper font-display hover:opacity-80 transition-opacity"
      >
        Keranjang ({items.length})
      </button>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
