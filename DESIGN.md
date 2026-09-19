# Design Direction: Thrift Anything

## Identity
Toko buku bekas di Surabaya. Satu eksemplar per judul, foto asli buku yang dijual,
kirim via Gojek Instant. Bukan marketplace generik: ini rak buku seseorang yang dibuka untuk umum.

## Personality
Hangat. Jujur. Kurasi, bukan katalog massal. Bookish tanpa jadi nostalgia kosong.

## Palette
Dua permukaan hangat, satu tinta, satu aksen. Tidak ada abu-abu.

| Token | Hex | Peran | Kontras |
|---|---|---|---|
| `paper` | `#FBF7EF` | Latar halaman (krem kertas) | - |
| `tan` | `#F1E8D8` | Permukaan naik: kartu, pita seksi | - |
| `ink` | `#1B1712` | Judul, harga | 16.7:1 on paper |
| `body` | `#3F362B` | Teks isi & label (cokelat tua, bukan abu) | 11.1:1 on paper |
| `rule` | `#DFD3BE` | Garis rambut dekoratif | non-text |
| `edge` | `#9E8055` | Batas fungsional: input, tombol outline | 3.5:1 on paper |
| `forest` | `#1F4D3A` | AKSEN: tombol utama, link | 9.0:1 on paper |
| `forest-deep` | `#173B2D` | Hover aksen + focus ring | 11.6:1 on paper |
| `clay` | `#A4442B` | WARNA STATUS saja: terjual, penanda diskon | 5.7:1 on paper |

### Aturan warna (alasan tertulis, R-01 / R-29)
- Hijau hutan dipilih sebagai aksen tunggal karena krem + hijau adalah pasangan kain/kertas
  yang tenang; oxblood lama dipakai di tombol, link, DAN harga sekaligus, jadi aksennya mati.
- Aksen hanya muncul di: tombol aksi utama, link teks, focus ring. Tidak di badge, tidak di harga,
  tidak di garis, tidak di latar (selain satu pita eco full-bleed).
- Harga memakai `ink` + serif display besar. Hirarki dari ukuran dan bentuk, bukan dari warna.
- `clay` bukan aksen kedua. Hanya menandai state nyata: TERJUAL dan harga coret.
- Abu-abu dihapus total dari palet. Teks sekunder = cokelat tua `body`, bukan `#6B6459`.

## Typography
- **Display: Fraunces** (variable, opsz/soft). Serif hangat dengan lengkung lembut, terbaca
  seperti sampul buku cetak. Dipilih di atas Playfair (terlalu fashion, kontras stroke tinggi
  bikin judul 2 baris jadi berisik) dan Instrument Serif lama (terlalu tipis di 18px).
- **Body: DM Sans**. Geometris tapi bulat, hangat, x-height tinggi, enak di 15-16px di HP.
- Dimuat lewat `next/font/google` dengan `display: swap` + subset latin. Tidak ada `@import`
  render-blocking ke fonts.googleapis.com.

## Tema
Terang saja. `color-scheme: light` dideklarasikan.
**Alasan (R-21/R-34):** krem kertas ADALAH identitas produknya. Varian gelap tidak pernah
didesain, dan versi lama mengirim abu-abu `#9B9089` yang belum pernah diuji ke pengguna
OS gelap. Satu tema yang benar mengalahkan dua tema yang setengah.

## Dial
- **ENERGY**: 2 (hangat, bukan diam total)
- **RHYTHM**: 2 (grid konsisten, dua jeda sengaja: pita fakta tipis + pita eco full-bleed)
- **MOTION**: 1 (hover + focus saja, 150ms. Tidak ada animasi scroll, tidak ada loop)

## Kartu buku: aturan tinggi
Judul 2 baris tidak boleh menggeser harga. Kartu = flex kolom tinggi penuh:
judul `line-clamp-2` dengan `min-height` terkunci 2 baris, penulis 1 baris terkunci,
blok harga + tombol didorong `mt-auto`. Semua baris kartu rata apa pun panjang judulnya.

## Yang dihindari
- Abu-abu di atas krem/putih
- Gradien, glassmorphism, glow, shadow mengambang
- Testimoni, angka, atau logo yang tidak nyata
- Ikon sparkle/lightning, emoji di UI, panah dekoratif di tombol
- Badge pil di atas H1

## Harga pembanding
`original_price` adalah harga normal buku baru di toko resmi, dibaca manual dari halaman
penjual (Periplus untuk impor, Gramedia untuk terbitan Indonesia, situs penerbit kalau
tidak ada di keduanya). Setiap baris menyimpan `original_price_source`, dan halaman detail
menampilkan tautan "cek sumbernya" plus tanggal pengecekan.

Aturan tampil (R-36 / C-5):
- Edisi **original**: harga coret + badge "N% di bawah harga toko". Bukunya sama, jadi
  klaim diskonnya jujur.
- Edisi **non-original**: TIDAK ada harga coret dan TIDAK ada badge persen. Yang tampil
  hanya baris "Eksemplar ini bukan edisi resmi. Edisi resmi baru dijual Rp...". Mencoret
  harga edisi resmi untuk barang yang bukan edisi itu adalah klaim palsu.
- Tidak ada `original_price`: tidak ada pembanding sama sekali.
- `original_price <= price`: pembanding otomatis disembunyikan.
