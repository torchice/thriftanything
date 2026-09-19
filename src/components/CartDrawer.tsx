'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { buildOrderMessage, getWhatsAppLink } from '@/lib/whatsapp';

interface Buyer {
  name: string;
  address: string;
  phone: string;
}

const EMPTY: Buyer = { name: '', address: '', phone: '' };
const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

export function CartDrawer({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, clear, total } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [buyer, setBuyer] = useState<Buyer>(EMPTY);
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const errorId = useId();

  const handleClose = () => {
    setStep('cart');
    setBuyer(EMPTY);
    setError('');
    onClose();
  };

  // R-32: Escape closes the dialog, Tab stays inside it, focus lands on open.
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyer.name.trim() || !buyer.address.trim() || !buyer.phone.trim()) {
      setError('Nama, alamat, sama nomor WA-nya diisi semua ya.');
      return;
    }
    if (!/^(\+?62|0)8\d{7,12}$/.test(buyer.phone.replace(/[\s-]/g, ''))) {
      setError('Nomor WA-nya kayaknya keliru. Contohnya: 081216530559.');
      return;
    }

    window.open(getWhatsAppLink(buildOrderMessage(items, buyer)), '_blank');
    clear();
    handleClose();
  };

  const field =
    'w-full border border-edge bg-paper px-3 py-2 text-base text-ink placeholder:text-body/55 focus:border-forest focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-deep';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup keranjang"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-edge bg-paper sm:w-[26rem]"
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 id={titleId} className="font-display text-xl text-ink">
            {step === 'cart' ? 'Keranjang' : 'Alamat kirim'}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] text-sm text-body hover:text-forest-deep"
          >
            Tutup
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'cart' ? (
            items.length === 0 ? (
              <div className="border border-rule bg-tan px-5 py-10 text-center">
                <p className="font-display text-lg text-ink">Keranjangnya masih kosong</p>
                <p className="mt-2 text-sm text-body">
                  Tutup dulu ini terus pilih bukunya dari rak. Keranjangnya kesimpen
                  di browser kamu sampai pesanannya kekirim.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-rule border-y border-rule">
                {items.map((item) => (
                  <li key={item.slug} className="flex items-start gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base text-ink">{item.title}</p>
                      <p className="mt-1 text-xs text-body">
                        {item.edition === 'original' ? 'Ori' : 'Bukan ori'}
                      </p>
                      <p className="mt-2 font-display text-lg text-ink">
                        {rupiah(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      className="min-h-[44px] shrink-0 text-sm text-clay underline underline-offset-4 hover:text-ink"
                    >
                      Hapus
                      <span className="sr-only"> {item.title} dari keranjang</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="buyer-name" className="mb-1.5 block text-sm text-body">
                  Nama lengkap
                </label>
                <input
                  id="buyer-name"
                  name="name"
                  autoComplete="name"
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={field}
                  placeholder="Nama yang nerima paket"
                />
              </div>

              <div>
                <label htmlFor="buyer-address" className="mb-1.5 block text-sm text-body">
                  Alamat lengkap
                </label>
                <textarea
                  id="buyer-address"
                  name="address"
                  autoComplete="street-address"
                  value={buyer.address}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={`${field} min-h-24 resize-y`}
                  placeholder="Jalan, nomor, kelurahan, kecamatan, kota, kode pos"
                />
              </div>

              <div>
                <label htmlFor="buyer-phone" className="mb-1.5 block text-sm text-body">
                  Nomor WhatsApp
                </label>
                <input
                  id="buyer-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={buyer.phone}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={field}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {error && (
                <p
                  id={errorId}
                  role="alert"
                  className="border-l-4 border-clay bg-tint-clay px-3 py-2 text-sm text-clay"
                >
                  {error}
                </p>
              )}

              <div className="border-t border-rule pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-body">{items.length} buku</span>
                  <span className="font-display text-2xl text-ink">
                    {rupiah(total)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-body">
                  Belum ongkir. Total akhirnya nanti aku bales di WhatsApp.
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-2 border-t border-rule px-5 py-4">
          {step === 'cart' && items.length > 0 && (
            <>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-body">Subtotal</span>
                <span className="font-display text-2xl text-ink">{rupiah(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="min-h-[48px] w-full bg-forest px-4 font-display text-lg text-paper transition-colors hover:bg-forest-deep"
              >
                Lanjut isi alamat
              </button>
            </>
          )}

          {step === 'checkout' && (
            <>
              <button
                type="submit"
                form="checkout-form"
                className="min-h-[48px] w-full bg-forest px-4 font-display text-lg text-paper transition-colors hover:bg-forest-deep"
              >
                Kirim pesanannya ke WA aku
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  setError('');
                }}
                className="min-h-[44px] w-full border border-edge px-4 text-sm text-body transition-colors hover:border-forest hover:text-forest-deep"
              >
                Balik ke keranjang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
