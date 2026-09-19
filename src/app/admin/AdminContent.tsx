'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Book {
  slug: string;
  title: string;
  price: number;
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

  if (loading) {
    return <div className="text-muted">Memuat...</div>;
  }

  if (!authenticated) {
    return (
      <form onSubmit={handleLogin} className="max-w-xs space-y-4">
        <div>
          <label className="block text-sm text-muted mb-2">Password Admin</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-rule bg-paper text-ink focus:outline-none focus:border-accent"
            placeholder="Masukkan password"
          />
        </div>

        {error && (
          <div className="text-sm text-accent bg-accent/10 px-3 py-2">{error}</div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-accent text-paper font-display hover:opacity-80"
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
          className="px-4 py-2 border border-rule text-ink hover:bg-rule/50"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="text-sm text-accent bg-accent/10 px-4 py-3">{error}</div>
      )}

      {/* Books table */}
      <div className="overflow-x-auto border border-rule">
        <table className="w-full text-sm">
          <thead className="border-b border-rule bg-rule/30">
            <tr>
              <th className="text-left px-4 py-3 font-display">Judul</th>
              <th className="text-left px-4 py-3 font-display">Edisi</th>
              <th className="text-right px-4 py-3 font-display">Harga</th>
              <th className="text-center px-4 py-3 font-display">Status</th>
              <th className="text-center px-4 py-3 font-display">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book.slug}
                className={`border-b border-rule hover:bg-rule/20 ${
                  book.sold ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">{book.title}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {book.edition === 'original' ? 'Original' : 'Non-Original'}
                </td>
                <td className="text-right px-4 py-3">
                  Rp{book.price.toLocaleString('id-ID')}
                </td>
                <td className="text-center px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 ${
                      book.sold
                        ? 'bg-accent/20 text-accent'
                        : 'bg-green-100/50 text-green-700'
                    }`}
                  >
                    {book.sold ? 'TERJUAL' : 'TERSEDIA'}
                  </span>
                </td>
                <td className="text-center px-4 py-3">
                  <button
                    onClick={() => toggleSold(book.slug, book.sold)}
                    disabled={togglingSlug === book.slug}
                    className={`px-3 py-1 text-xs border transition-all ${
                      togglingSlug === book.slug
                        ? 'opacity-50 cursor-not-allowed'
                        : book.sold
                          ? 'border-green-600 text-green-600 hover:bg-green-50'
                          : 'border-accent text-accent hover:bg-accent/10'
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

      <div className="text-sm text-muted">
        Total: {books.length} buku
        {books.some((b) => b.sold) && (
          <>
            <br />
            Terjual: {books.filter((b) => b.sold).length} buku
          </>
        )}
      </div>
    </div>
  );
}
