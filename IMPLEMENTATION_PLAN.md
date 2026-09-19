# Implementation Plan — Book Order Site (WhatsApp checkout)

**Stack:** Next.js 15 (App Router, TS) · Tailwind · Supabase Postgres · Vercel
**Checkout:** no payment gateway — cart → prefilled WhatsApp to `081216530559`
**Admin:** single password, httpOnly cookie, mark-sold toggle only
**Locale:** UI Bahasa Indonesia. Fulfilment line kept in English per spec: *"Prioritize Surabaya Area Via Gojek Instant"*

> Project root: `Application/bukubekas` (created). Rename freely.
> Real stock already ingested: **29 books** from `~/Downloads/book/WhatsApp Unknown 2026-09-19 at 4.57.57 PM`.

---

## 1. Data model

### `books`
| column | type | notes |
|---|---|---|
| `id` | uuid pk default `gen_random_uuid()` | |
| `slug` | text unique | url + stable key |
| `title` | text not null | |
| `author` | text | nullable, still useful in listing |
| `description` | text not null | short — 1–3 sentences |
| `language` | text not null | enum-ish: `id` / `en` / other |
| `price` | integer not null | **rupiah, no decimals** — store 85000 not 85000.00 |
| `edition` | text not null | `original` \| `non_original` |
| `photo_url` | text not null | Supabase Storage public URL |
| `sold` | boolean default false | |
| `sold_at` | timestamptz null | set on toggle, for your own records |
| `created_at` | timestamptz default now() | listing order |

One row = one physical copy. No stock counter.

### RLS
- `select` → public, **only when `sold = false` is not required** (sold books stay visible, greyed). So: public select all columns except nothing — plain `using (true)`.
- `insert/update/delete` → **no public policy**. Admin writes go through server-side route using the service-role key. Service key never reaches the browser.

### Storage
Bucket `book-photos`, public read. Photos uploaded manually via Supabase dashboard (admin scope = mark-sold only).

### Seeding (because admin has no CRUD)
`scripts/seed-books.ts`: reads `data/books.csv`, upserts on `slug` via service-role client. Run `pnpm seed` after adding rows + photos. This is the stock-intake workflow — without it every new book is hand-written SQL.

---

## 1b. Stock already in repo

```
bukubekas/
  assets/raw/<slug>.jpg     29 photos, copied from Downloads, rotation corrected
  data/books.csv            29 rows — slug,title,author,language,edition,price,description,photo
  scripts/normalize-photos.sh   (to write) crop + resize + webp -> public/books/
```

**Catalog (29):** Jago Kuasai Bahasa Mandarin · 7 Rules of Power · Check Up Kepribadianmu · Find Your Why · Embrace the Night · Southtown · Multi Bagger · Investasi Cerdas · Crypto Trading Guide · Mulai Mengerti · Keajaiban Toko Kelontong Namiya · The Da Vinci Code · Angels & Demons · Copy Writing · The Ride of a Lifetime · How to Win Friends & Influence People in the Digital Age · The 7 Habits of Highly Effective People · Steve Jobs · The Mountain Is You · Men's Guide to Style · Being Warren Buffett · Chasing Unicorns · The Janus Stone · How to Close a Deal Like Warren Buffett · You Do You · Thinking, Fast and Slow · Thrivers · Sky Key · The Wealth of Nations.

Mix: ~10 Indonesian, ~19 English. Heavy on business/investing/self-help, plus fiction (Dan Brown, Riordan, Higashino, Griffiths, Frey) and two language/style titles.

**Two CSV columns are empty and block P1 — you fill them:**
- `price` — rupiah integer, no separators (`45000`). Only price sticker visible in photos: You Do You.
- `edition` — `original` or `non_original` per copy. Not guessable from a photo; mislabelling an unlicensed reprint as original is the one claim that can actually get the site taken down. Several English titles here (7 Rules of Power, Find Your Why, Thinking Fast and Slow, 7 Habits) are commonly local reprints — check the spine and paper before deciding.

### Photo pipeline
Photos are phone shots on a dark desk, mixed orientation. Rotation already fixed in `assets/raw/`. Remaining work in `normalize-photos.sh`:
1. Crop to cover bounds — kill the desk, keyboard, and the shadow of the person shooting.
2. Force **2:3 portrait**, 1000×1500, `cover` fit.
3. Export `.webp` q80 into `public/books/<slug>.webp` (~60–90 KB each), plus a 20px blurred base64 for `placeholder="blur"`.
4. Re-shoot candidates: `investasi-cerdas` (crop is landscape, top of cover cut), `you-do-you` and `crypto-trading-guide` (photographer shadow across the cover), `the-da-vinci-code` (torn cover — fine to sell, but shoot it straight so the damage looks disclosed, not hidden).

Until crops exist, the grid must not stretch images: `aspect-[2/3]` + `object-cover` + neutral `--rule` background.

## 2. Routes

| path | type | purpose |
|---|---|---|
| `/` | server component | hero + catalog grid + how-to-order + shipping + FAQ |
| `/buku/[slug]` | server component | detail: big photo, full description, add-to-cart |
| `/api/admin/login` | route handler POST | compare password, set cookie |
| `/api/admin/logout` | route handler POST | clear cookie |
| `/api/admin/sold` | route handler POST | `{id, sold}` → service-role update, guarded by cookie |
| `/admin` | server component | login form **or** book list + toggles |
| `middleware.ts` | — | `/admin` without valid cookie → render login state |

Cart is client-side only (`localStorage`), surfaced as a drawer — no `/cart` page needed, but a `/checkout`-style drawer step collects buyer details.

---

## 3. WhatsApp order flow

1. Buyer adds books → drawer shows lines + total.
2. Drawer step 2 form (all required): **Nama**, **Alamat lengkap**, **Nomor WhatsApp**.
3. Button builds message, opens `https://wa.me/6281216530559?text=<encoded>`.

`lib/whatsapp.ts`:

```ts
const ADMIN_WA = "6281216530559"; // 08… → 62…

export function buildOrderMessage(items: CartItem[], buyer: Buyer) {
  const lines = items.map(
    (b, i) =>
      `${i + 1}. ${b.title} (${b.edition === "original" ? "Original" : "Non-Original"}) — Rp${b.price.toLocaleString("id-ID")}`
  );
  const total = items.reduce((s, b) => s + b.price, 0);

  return [
    "HI i want order:",
    ...lines,
    "",
    `Total: Rp${total.toLocaleString("id-ID")}`,
    "",
    `Name: ${buyer.name}`,
    `Address: ${buyer.address}`,
    `Phone Number: ${buyer.phone}`,
  ].join("\n");
}

export const waLink = (msg: string) =>
  `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;
```

**Sold-race guard:** before opening WhatsApp, re-fetch the cart ids from Supabase. If any is now `sold`, block, show "Buku X sudah terjual", drop it from cart. Cheap, prevents the worst customer-service case.

---

## 4. Admin

- `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` in env.
- Login POST → constant-time compare → cookie `admin_session` = HMAC-SHA256 of `exp|nonce`, `httpOnly`, `secure`, `sameSite=lax`, 7-day expiry. No JWT lib needed; `node:crypto` is enough.
- `/admin` table: photo thumb · title · price · edition · sold switch. Optimistic toggle, revert on error.
- Rate-limit login: 5 attempts / 10 min per IP, in-memory Map is fine at this volume.
- `SUPABASE_SERVICE_ROLE_KEY` only in route handlers. Never in a `NEXT_PUBLIC_` var.

---

## 5. Design — editorial bookshop, anti-slop

**Bans:** purple/indigo gradients, glassmorphism, floating 3D blobs, `shadow-2xl` cards, emoji bullets, "Discover / Unlock / Elevate" copy, centered-everything hero, generic stock photos.

**Tokens**
```
--paper   #F7F4ED   page ground
--ink     #16130F   text
--muted   #6B6459   secondary
--rule    #DED7C9   1px hairlines (the main structural device)
--accent  #8A2B1E   oxblood — sold stamp, price, links only
```
Dark mode: `#14120F` ground, `#EFEAE0` ink, same oxblood shifted to `#C4553F`.

**Type**
- Display: **Instrument Serif** (or Libre Baskerville) — titles, hero, prices.
- Body/UI: **Inter Tight** at 15px, generous `leading-relaxed`.
- Catalog title 18–20px, never uppercase. Metadata in 12px letterspaced small-caps.

**Layout**
- Hero: left-aligned, two columns. Left = one serif sentence + the Gojek line + primary CTA scrolling to catalog. Right = a single real photo of a stack of books, not an illustration.
- Catalog: 2 cols mobile / 3 tablet / 4 desktop. Cards are **borderless** — photo, then hairline rule, then title / language / edition / price. Whitespace + rules do the work, no box shadows.
- Edition badge: text, not pill — `ORIGINAL` in ink, `NON-ORIGINAL` in muted, 11px tracked.
- Sold: photo desaturated to 15% opacity overlay + rotated `TERJUAL` stamp in oxblood, button replaced by disabled text "Sudah terjual".
- Sticky bottom bar on mobile showing cart count + total; desktop uses a top-right cart button.

**Copy (ID, with the required English line verbatim)**
- Hero H1: `Buku bekas pilihan, satu eksemplar per judul.`
- Hero sub: `Prioritize Surabaya Area Via Gojek Instant` — kirim hari ini juga, ongkir dibayar di tempat.
- Section: `Katalog` · `Cara Pesan` · `Pengiriman` · `Tanya Jawab`
- Cara Pesan: 3 steps, plain sentences, numbered with rules not icons — Pilih buku → Isi nama & alamat → Kirim ke WhatsApp, admin balas konfirmasi + total ongkir.
- Pengiriman block leads with the English line, then: `Luar Surabaya dikirim via JNE/J&T, ongkir menyusul setelah konfirmasi.`

---

## 6. Build phases

**P0 — Scaffold (30 min)**
`create-next-app` TS+Tailwind → fonts via `next/font/google` → tokens in `globals.css` → `lib/supabase/{client,admin}.ts`.

**P1 — Data (45 min)**
SQL migration for `books` + RLS + storage bucket. Fill `price` + `edition` in `data/books.csv` (29 rows already written). Run `normalize-photos.sh`, upload `public/books/*.webp` to the `book-photos` bucket, then `pnpm seed`.

**P2 — Catalog (2.5 h)**
`/` server-fetches books ordered `sold asc, created_at desc`. `BookCard`, `EditionBadge`, `SoldStamp`, `/buku/[slug]` detail. `next/image` + Supabase host in `remotePatterns`. `export const revalidate = 60`.
At 29 titles add a filter row — Semua / Bahasa Indonesia / English / Fiksi / Bisnis & Investasi — as plain text links with a URL param, no dropdown, no client state. Below ~40 books, skip search entirely.

**P3 — Cart + WhatsApp (2 h)**
`CartProvider` (localStorage, hydration-safe — render count only after mount). Drawer: items → buyer form → validate (phone regex `^(\+?62|0)8\d{7,12}$`) → sold re-check → `waLink`. Toast on removal of sold items.

**P4 — Admin (1.5 h)**
Login route + cookie helpers + middleware + `/admin` table + `/api/admin/sold`.

**P5 — Landing polish (2 h)**
Hero, Cara Pesan, Pengiriman, FAQ, footer with WA link. Responsive pass at 375 / 768 / 1280. Dark mode check.

**P6 — Ship (45 min)**
`metadata` + OG image, `robots.txt`, `sitemap.ts`. Vercel project, env vars, domain. Lighthouse ≥ 95 mobile.

Total ≈ 9–10 h.

---

## 7. Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=           # openssl rand -hex 32
NEXT_PUBLIC_WA_NUMBER=6281216530559
```

## 8. Risks / decisions logged

- **No CRUD admin** (your call): every stock intake = edit CSV + upload photo + `pnpm seed`. Revisit if you add >10 books/week.
- **Titles read off photos by eye**, not from ISBNs. Check spelling against the physical copy before seeding — `Chasing Unicorns` subtitle and the two Warren Buffett titles are the easiest to confuse.
- **No payment**: orders are leads until you confirm on WhatsApp. `sold` must be toggled manually and fast, or two buyers claim one copy. The pre-send sold-check mitigates, doesn't eliminate.
- **Buyer PII** (name/address/phone) exists only in the WhatsApp message — never stored in Postgres, never logged. Keep repo private and never commit screenshots of chats.
- **Non-original editions**: labelled plainly. Don't use publisher logos, and never mark a reprint `original` to lift the price.
- **Photos are yours** — real shots of the actual copy. Keep it that way; don't swap in publisher cover art, buyers of used books judge condition from the real photo.
