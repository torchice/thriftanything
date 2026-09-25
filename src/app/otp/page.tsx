import { OtpContent } from './OtpContent';

export const metadata = {
  title: 'OTP GolekTruk',
  robots: 'noindex, nofollow'
};

export const dynamic = 'force-dynamic';

export default function OtpPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="py-10 px-4 md:py-16 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl mb-2">OTP GolekTruk</h1>
          <p className="text-body text-sm mb-8">
            Pesan WhatsApp dari GolekTruk, update otomatis tiap 5 detik.
          </p>
          <OtpContent />
        </div>
      </div>
    </main>
  );
}
