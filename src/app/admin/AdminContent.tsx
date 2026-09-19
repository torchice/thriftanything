'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Book {
  slug: string;
  title: string;
  price: number;
  original_price?: number;
  edition: string;
  sold: boolean;
  photo_url: string;
}

export function AdminContent() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/sold', { method: 'POST', body: JSON.stringify({}) });
      setAuthenticated(res.status !== 401);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setPassword('');
        setAuthenticated(true);
        fetchBooks();
      } else {
        setError('Password tidak valid');
      }
    } catch (err) {
      setError('Error logging in');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setBooks([]);
  }

  async function fetchBooks() {
    const supabase = createClient();
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setBooks(data);
    }
  }

  async function toggleSold(slug: string, currentSold: boolean) {
    setTogglingSlug(slug);
    try {
      const res = await fetch('/api/admin/sold', {
        method: 'POST',
        body: JSON.stringify({ slug, sold: !currentSold })
      });

      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b.slug === slug ? { ...b, sold: !currentSold } : b
          )
        );
      } else {
        setError('Gagal memperbarui status');
      }
    } catch (err) {
      setError('Error updating book');
    } finally {
      setTogglingSlug(null);
    }
  }

  async function updatePrice(slug: string) {
    if (!editPrice || isNaN(Number(editPrice)) || Number(editPrice) < 0) {
      setError('Harga baru tidak valid');
      return;
    }

    try {
      const res = await fetch('/api/admin/update-price', {
        method: 'POST',
        body: JSON.stringify({
          slug,
          price: Number(editPrice),
          original_price: editOriginalPrice ? Number(editOriginalPrice) : null
        })
      });

      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b.slug === slug
              ? {
                  ...b,
                  price: Number(editPrice),
                  original_price: editOriginalPrice ? Number(editOriginalPrice) : undefined
                }
              : b
          )
        );
        setEditingSlug(null);
        setEditPrice('');
        setEditOriginalPrice('');
      } else {
        setError('Gagal memperbarui harga');
      }
    } catch (err) {
      setError('Error updating price');
    }
  }

  function openPriceEditor(book: Book) {
    setEditingSlug(book.slug);
    setEditPrice(book.price.toString());
    setEditOriginalPrice(book.original_price?.toString() || '');
  }

  if (loading) {
    return <div className="text-body">Memuat...</div>;
  }

  if (!authenticated) {
    return (
      <form onSubmit={handleLogin} className="max-w-xs space-y-4">
        <div>
          <label className="block text-sm text-body mb-2">Password Admin</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-forest"
            placeholder="Masukkan password"
          />
        </div>

        {error && (
          <div className="text-sm text-forest bg-tint-clay px-3 py-2">{error}</div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-forest text-paper font-display hover:opacity-80"
        >
          Login
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logout */}
      <div className="text-right">
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-rule text-ink hover:bg-tan"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="text-sm text-forest bg-tint-clay px-4 py-3">{error}</div>
      )}

      {/* Books table */}
      <div className="overflow-x-auto border border-rule">
        <table className="w-full text-sm">
          <thead className="border-b border-rule bg-tan">
            <tr>
              <th className="text-left px-4 py-3 font-display">Judul</th>
              <th className="text-left px-4 py-3 font-display">Edisi</th>
              <th className="text-right px-4 py-3 font-display">Harga Saat Ini</th>
              <th className="text-right px-4 py-3 font-display">Harga Asli</th>
              <th className="text-center px-4 py-3 font-display">Status</th>
              <th className="text-center px-4 py-3 font-display">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book.slug}
                className={`border-b border-rule hover:bg-tan ${
                  book.sold ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">{book.title}</td>
                <td className="px-4 py-3 text-xs text-body">
                  {book.edition === 'original' ? 'Original' : 'Non-Original'}
                </td>
                <td className="text-right px-4 py-3">
                  Rp{book.price.toLocaleString('id-ID')}
                </td>
                <td className="text-right px-4 py-3 text-sm">
                  {book.original_price ? (
                    <span className="text-body line-through">
                      Rp{book.original_price.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-body">belum diisi</span>
                  )}
                </td>
                <td className="text-center px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 ${
                      book.sold
                        ? 'bg-tint-clay text-clay'
                        : 'bg-green-100/50 text-green-700'
                    }`}
                  >
                    {book.sold ? 'TERJUAL' : 'TERSEDIA'}
                  </span>
                </td>
                <td className="text-center px-4 py-3 space-x-1">
                  <button
                    onClick={() => openPriceEditor(book)}
                    className="px-3 py-1 text-xs border border-edge text-body hover:bg-tan transition-all"
                  >
                    Edit Harga
                  </button>
                  <button
                    onClick={() => toggleSold(book.slug, book.sold)}
                    disabled={togglingSlug === book.slug}
                    className={`px-3 py-1 text-xs border transition-all ${
                      togglingSlug === book.slug
                        ? 'opacity-50 cursor-not-allowed'
                        : book.sold
                          ? 'border-green-600 text-green-600 hover:bg-green-50'
                          : 'border-forest text-forest hover:bg-tint-clay'
                    }`}
                  >
                    {book.sold ? 'Kembalikan' : 'Tandai Terjual'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-body">
        Total: {books.length} buku
        {books.some((b) => b.sold) && (
          <>
            <br />
            Terjual: {books.filter((b) => b.sold).length} buku
          </>
        )}
      </div>

      {/* Price edit modal */}
      {editingSlug && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditingSlug(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-paper border border-rule p-6 z-50 w-96 shadow-lg">
            <h3 className="font-display text-lg mb-4">Edit Harga</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-body mb-2">Harga Saat Ini (Rp)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm text-body mb-2">Harga Asli (Rp) - Optional</label>
                <input
                  type="number"
                  value={editOriginalPrice}
                  onChange={(e) => setEditOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-forest"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePrice(editingSlug)}
                  className="flex-1 py-2 px-4 bg-forest text-paper font-display hover:opacity-80"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setEditingSlug(null)}
                  className="flex-1 py-2 px-4 border border-rule text-ink hover:bg-tan"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
