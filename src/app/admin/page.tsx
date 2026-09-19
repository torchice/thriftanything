import { Suspense } from 'react';
import { AdminContent } from './AdminContent';

export const metadata = {
  title: 'Admin - Thrift Anything',
  robots: 'noindex, nofollow'
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="py-12 px-6 md:py-20 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl mb-8">Admin Dashboard</h1>
          <Suspense fallback={<div className="text-body">Memuat...</div>}>
            <AdminContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
