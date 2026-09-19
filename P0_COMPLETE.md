# P0 — Scaffold Complete ✓

**Status:** Next.js 15 + Tailwind + TypeScript setup done. Build succeeds.

## What's in place

- **Core:** `src/app/{layout,page,globals.css}`, `tsconfig`, `next.config`, Tailwind + PostCSS config
- **Supabase:** `src/lib/supabase/{client,admin}.ts` — browser + server API ready
- **WhatsApp:** `src/lib/whatsapp.ts` — order message builder + link generator
- **Design tokens:** Paper/ink/muted/rule/accent palette via CSS vars + Tailwind theme
- **Fonts:** Instrument Serif + Inter Tight from Google Fonts, auto-loaded
- **Scripts:** `scripts/seed-books.ts` (run after DB created), `scripts/normalize-photos.sh` (image pipeline)
- **Migrations:** `scripts/migrations/001_create_books.sql` — books table + RLS config
- **Env template:** `.env.local` with all required keys (fill them in before P1)

## Next up

### P1 — Data (you do this)

1. Create Supabase project (or use existing)
2. Fill `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (copy from Supabase project settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (copy from same)
   - `ADMIN_PASSWORD` (make one up, secret)
   - `ADMIN_SESSION_SECRET` (run `openssl rand -hex 32`)
3. In Supabase dashboard:
   - Copy SQL from `scripts/migrations/001_create_books.sql`, run in SQL editor
   - Create storage bucket `book-photos`, set to public
4. Fill `data/books.csv` missing columns:
   - `price` — rupiah integer. Only visible: You Do You. Estimate others or re-shoot with sticker in photo.
   - `edition` — check spine/paper of each copy. Non-original = local reprint.
5. Optional: shoot new photos of `investasi-cerdas`, `you-do-you`, `crypto-trading-guide`, `the-da-vinci-code` (see plan for reasons)
6. Run `bash scripts/normalize-photos.sh` → crops + resizes to 1000×1500 webp into `public/books/`
7. Upload `public/books/*.webp` to Supabase bucket `book-photos`
8. Run `npm run seed` → populates books table

### P2 — Catalog
Fetch + display books grid, `/buku/[slug]` detail, sold state, add-to-cart button.

### P3 — Cart + WhatsApp
localStorage cart, drawer with buyer form, `buildOrderMessage`, sold-race guard.

### P4 — Admin
Login route, cookie middleware, `/admin` sold-toggle table.

### P5 — Landing polish
Hero, Cara Pesan, Pengiriman, FAQ sections. Responsive + dark mode.

### P6 — Ship
OG image, `robots.txt`, `sitemap.ts`, Vercel deploy.

## Run dev server

```bash
npm run dev
# localhost:3000 — shows skeleton landing (catalog empty until DB seeded)
```

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` stays server-only (`src/lib/supabase/admin.ts`), never in browser
- `ADMIN_PASSWORD` hashed in route handler, not stored
- RLS policy: public can read all books, only service role can write
- Buyer PII (name/address/phone) never stored; lives only in WhatsApp message

## Next milestone

Once you fill `price` + `edition` in CSV and Supabase is configured, say "P1 done" and I'll scaffold P2 (catalog display).
