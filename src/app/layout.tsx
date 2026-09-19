import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import { CartProvider } from '@/lib/CartContext';
import { PageLayout } from '@/components/PageLayout';
import './globals.css';

// Display: warm serif with soft curves, reads like a printed book cover (DESIGN.md).
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  weight: 'variable',
  variable: '--font-display'
});

// Body: geometric but round, high x-height, comfortable at 16px on a phone.
const body = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: 'variable',
  variable: '--font-body'
});

const DESCRIPTION =
  'Rak buku bekas punya aku di Surabaya. Satu judul satu biji, fotonya buku yang aslinya, kirim bisa nyampe hari itu juga lewat Gojek Instant.';

export const metadata: Metadata = {
  title: {
    default: 'Thrift Anything, rak buku pribadi di Surabaya',
    template: '%s | Thrift Anything'
  },
  description: DESCRIPTION,
  openGraph: {
    title: 'Thrift Anything, rak buku pribadi di Surabaya',
    description: DESCRIPTION,
    locale: 'id_ID',
    type: 'website'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF7EF'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="bg-paper text-body">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-forest focus:px-4 focus:py-2 focus:text-paper"
        >
          Langsung ke isi
        </a>
        <CartProvider>
          <PageLayout>{children}</PageLayout>
        </CartProvider>
      </body>
    </html>
  );
}
