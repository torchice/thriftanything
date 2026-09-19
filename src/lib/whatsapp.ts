export interface CartItem {
  slug: string;
  title: string;
  edition: 'original' | 'non_original';
  price: number;
}

export interface Buyer {
  name: string;
  address: string;
  phone: string;
}

const ADMIN_WA = '6281216530559';

export function buildOrderMessage(items: CartItem[], buyer: Buyer): string {
  const lines = items.map(
    (b, i) =>
      `${i + 1}. ${b.title} (${b.edition === 'original' ? 'Ori' : 'Bukan ori'}): Rp${b.price.toLocaleString('id-ID')}`
  );
  const total = items.reduce((s, b) => s + b.price, 0);

  return [
    'Halo, aku mau pesen buku ini:',
    ...lines,
    '',
    `Subtotal: Rp${total.toLocaleString('id-ID')} (belum ongkir)`,
    '',
    `Nama: ${buyer.name}`,
    `Alamat: ${buyer.address}`,
    `WhatsApp: ${buyer.phone}`
  ].join('\n');
}

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
}
