import type { Metadata } from 'next';
import { CartProvider } from '@/lib/CartContext';
import { PageLayout } from '@/components/PageLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Buku Bekas',
  description: 'Buku bekas pilihan, satu eksemplar per judul. Prioritize Surabaya Area Via Gojek Instant.',
  openGraph: {
    title: 'Buku Bekas',
    description: 'Buku bekas pilihan, satu eksemplar per judul. Prioritize Surabaya Area Via Gojek Instant.'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <CartProvider>
          <PageLayout>{children}</PageLayout>
        </CartProvider>
      </body>
    </html>
  );
}
