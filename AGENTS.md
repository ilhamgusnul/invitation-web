# AGENTS.md — Pedoman untuk Code Agent

## Tujuan

Menjaga konsistensi implementasi platform Web Undangan tanpa TanStack, memakai Zustand untuk state client, dan Supabase sebagai backend.

## Lingkup & Non-Lingkup

**Lingkup:** landing, katalog tema, preview, autentikasi, dashboard (wizard, details, schedule, gallery, rsvp, theme, publish), guests, analytics, broadcasts API stub, halaman publik undangan. **Non-Lingkup:** pembayaran gateway production, notifikasi WA/Email production, editor rich text kompleks, load testing besar (dokumentasikan hook-nya saja).

## Aturan Utama

1. **Dilarang** menambah TanStack Query/SWR/Redux atau lib state lain. Gunakan **Zustand**.
2. **Read** data: RSC atau `GET` API + cache. **Mutasi**: Route Handlers/Server Actions.
3. Validasi semua input dengan `zod`. Tangani error dengan objek `{error:{code,message}}`.
4. Terapkan **RLS** di Supabase sesuai aturan app. Semua route memverifikasi kepemilikan resource.
5. Setelah mutasi, lakukan `revalidatePath` atau `router.refresh()`.
6. Ukuran komponen < 300 LOC. Pecah komponen jika melebihi.
7. Komentar kode singkat, bahasa Inggris, fokus niat/fungsi.
8. Commit messages **Conventional Commits**.

## Variabel Lingkungan (wajib)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```
## Script
Lihat script supabase dan lint di package.json


## Pola Commit

- `feat:` fitur baru (mis. `feat(wizard): autosave draft to /api/events`)
- `fix:` perbaikan bug
- `chore:` tooling, deps, config
- `refactor:` perubahan internal non-feature
- `test:` menambah/merapikan test
- `docs:` perubahan dokumentasi

## Definisi Selesai (DoD)

- Build sukses tanpa error/tsc warnings penting.
- Lint & format lulus.
- Rute/komponen memiliki test minimal untuk util/validator kritis.
- Akses tanpa login ke resource privat **tertutup** oleh RLS & middleware.
- Lighthouse: Performance ≥ 85 (landing & publik), A11y ≥ 90.

## Checklist Review PR

-

## Pedoman UI

- Tailwind + shadcn/ui. Skala radius, spacing, dan warna sesuai design system.
- Dashboard mobile-first; tabel scroll-x aman; tombol besar untuk aksi primer.
- Preview tema mendukung tokens (warna/typography) dan live update.

## Task Queue (urutan eksekusi agen)

1. **Init proyek**: setup deps, Tailwind, shadcn, Zustand, Supabase helpers.
2. **Schema & RLS**: tulis migration, enum, index; generate TS types.
3. **Landing + Themes**: grid, filter, preview interaktif.
4. **Auth**: login/daftar/forgot; middleware proteksi `/dashboard/**`.
5. **Wizard**: store, form core, autosave, theme picker, preview, publish.
6. **Public Page**: render RSC, OG image, RSVP/book guest form stub.
7. **Guests**: impor CSV, paginate server-side, search.
8. **Gallery**: upload storage, progress, sort, persist.
9. **Messages & RSVP**: endpoint publik + moderasi di dashboard.
10. **Analytics**: kartu metrik dasar + API agregasi sederhana.

## Kualitas & Observabilitas

- Tambahkan logging minimal pada route API (level info/error) tanpa bocor PII.
- Tangani edge cases: slug bentrok, file upload gagal, CSV invalid, rate-limit terpukul.

## Keamanan

- Hindari menyimpan kunci rahasia di client. Gunakan server helpers.
- Validasi MIME upload dan ukuran file.
- Rate-limit endpoint publik.

## Deployment & Build

- Target region SG. Gunakan ISR untuk halaman landing/preview.
- Pastikan env variabel tersedia di hosting. Jalankan migrasi sebelum deploy.

---

**Catatan:** Dokumen ini adalah sumber tunggal kebenaran untuk agen. Perubahan arsitektur harus memperbarui dokumen ini, termasuk skema, kontrak API, dan acceptance criteria.
