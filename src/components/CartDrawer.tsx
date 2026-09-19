'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { buildOrderMessage, getWhatsAppLink } from '@/lib/whatsapp';

interface Buyer {
  name: string;
  address: string;
  phone: string;
}

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, clear, total } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [buyer, setBuyer] = useState<Buyer>({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCheckout = () => {
    // Validate
    if (!buyer.name.trim() || !buyer.address.trim() || !buyer.phone.trim()) {
      setError('Semua field harus diisi');
      return;
    }

    // Validate phone
    const phoneRegex = /^(\+?62|0)8\d{7,12}$/;
    if (!phoneRegex.test(buyer.phone)) {
      setError('Nomor WhatsApp tidak valid');
      return;
    }

    // Build message
    const message = buildOrderMessage(items, buyer);
    const link = getWhatsAppLink(message);

    // Open WhatsApp
    window.open(link, '_blank');

    // Clear cart
    clear();
    onClose();
  };

  const handleClose = () => {
    setStep('cart');
    setBuyer({ name: '', address: '', phone: '' });
    setError('');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-paper shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule p-4 md:p-6">
          <h2 className="font-display text-lg">
            {step === 'cart' ? 'Keranjang' : 'Checkout'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted hover:text-ink text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {step === 'cart' ? (
            <>
              {items.length === 0 ? (
                <div className="text-center text-muted py-12">
                  Keranjang kosong
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.slug}
                      className="flex items-start justify-between border-b border-rule pb-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-display text-base mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted mb-2">
                          {item.edition === 'original' ? 'Original' : 'Non-Original'}
                        </p>
                        <p className="font-display text-accent">
                          Rp{item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-muted hover:text-accent text-sm ml-4"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-accent"
                  placeholder="Nama Anda"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Alamat Lengkap</label>
                <textarea
                  value={buyer.address}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-accent min-h-24 resize-none"
                  placeholder="Jl. ... Kota, Provinsi 12345"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={buyer.phone}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-accent"
                  placeholder="08123456789"
                />
              </div>

              {error && (
                <div className="text-sm text-accent bg-accent/10 px-3 py-2">
                  {error}
                </div>
              )}

              {/* Order summary */}
              <div className="border-y border-rule py-4 space-y-2">
                <div className="text-sm text-muted">
                  {items.length} buku
                </div>
                <div className="flex justify-between font-display text-accent">
                  <span>Total</span>
                  <span>Rp{total.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-xs text-muted">
                  Harga Exclude Ongkir
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-rule p-4 md:p-6 space-y-2">
          {items.length > 0 && step === 'cart' && (
            <button
              onClick={() => setStep('checkout')}
              className="w-full py-3 px-4 bg-accent text-paper font-display hover:opacity-80 transition-opacity"
            >
              Lanjut Checkout
            </button>
          )}

          {step === 'checkout' && (
            <>
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-accent text-paper font-display hover:opacity-80 transition-opacity"
              >
                Pesan Sekarang
              </button>
              <button
                onClick={() => setStep('cart')}
                className="w-full py-2 px-4 border border-rule text-ink font-body hover:bg-rule/50 transition-colors"
              >
                Kembali
              </button>
            </>
          )}

          <button
            onClick={handleClose}
            className="w-full py-2 px-4 text-muted font-body hover:text-ink transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}
