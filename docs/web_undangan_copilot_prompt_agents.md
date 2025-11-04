# PROMPT COPILOT — WEB UNDANGAN (Next.js + Supabase + Zustand, tanpa TanStack)

**Tujuan:** Bangun platform Web Undangan dengan landing page pilihan tema, autentikasi (Owner/Admin/User), dan dashboard kustomisasi undangan.

**Batasan & Prinsip:**

- **Jangan** gunakan TanStack Query / SWR / Redux. State client memakai **Zustand** per modul.
- Data **read** memakai RSC (`fetch`, `cache`, `revalidate`) dan **mutasi** via **Route Handlers/Server Actions**.
- Supabase: Auth, Postgres, Storage, RLS ketat per `org_id`/`event_id`.
- Kode TypeScript, App Router, Tailwind + shadcn/ui, aksesibilitas dasar, performa dan SEO.

---

## Arsitektur & Struktur Proyek

```
/app
  /(public)
    /page.tsx                     # Landing
    /themes/page.tsx              # Katalog tema (grid)
    /themes/[slug]/page.tsx       # Preview tema (RSC)
  /auth/login/page.tsx
  /auth/register/page.tsx
  /auth/forgot/page.tsx
  /dashboard/page.tsx             # Home ringkas + wizard status
  /dashboard/event/new/page.tsx   # Wizard pembuatan event (client)
  /dashboard/event/[id]/edit/page.tsx  # Tabs edit
  /dashboard/guests/page.tsx
  /dashboard/analytics/page.tsx
  /dashboard/broadcasts/page.tsx
  /[eventSlug]/page.tsx           # Halaman undangan publik (RSC)
/components
  /ui/*                           # shadcn components
  /forms/*
  /cards/*
  /preview/*
/lib
  /supabase/server.ts
  /supabase/client.ts
  /auth.ts
  /validators/*                   # zod schemas
  /utils.ts
  /og.ts                          # generator OG image
/state
  /useWizardStore.ts
  /useThemePickerStore.ts
  /useGuestTableStore.ts
  /useMediaUploaderStore.ts
  /useToastStore.ts
  /useAuthUiStore.ts
/app/api
  /events/route.ts
  /events/[id]/route.ts
  /events/[id]/publish/route.ts
  /guests/route.ts
  /guests/[id]/route.ts
  /messages/route.ts
  /rsvp/route.ts
  /media/route.ts
  /donations/route.ts
  /broadcasts/route.ts
  /analytics/route.ts
```

---

## Skema Database (Supabase)

- `users(id, name, email, avatar_url, created_at)`
- `orgs(id, name, owner_id, plan, created_at)`
- `org_members(org_id, user_id, role enum: owner|admin, created_at)`
- `themes(id, slug, name, preview_url, tokens jsonb, is_premium boolean)`
- `events(id, org_id?, user_id, slug unique, title, theme_id, status enum: draft|published, publish_at, expire_at, created_at, updated_at)`
- `event_details(event_id fk, couple jsonb, story text, music_url text, seo_meta jsonb)`
- `schedules(id, event_id, title, datetime timestamptz, tz text, venue_id)`
- `venues(id, event_id, name, address, lat numeric, lng numeric, note)`
- `guests(id, event_id, name, phone text, email text, segment text, pin text, invite_token text, status enum: invited|sent|opened|rsvped)`
- `rsvps(id, guest_id, status enum: yes|no|maybe, pax int, note text, created_at)`
- `messages(id, event_id, name, message, approved boolean default false, created_at)`
- `media(id, event_id, type enum: image|video, url, sort int)`
- `donations(id, event_id, method enum: qris|transfer, amount numeric, name, note, proof_url, status enum: pending|confirmed|rejected, created_at)`
- `analytics_events(id, event_id, type text, meta jsonb, created_at)`

**RLS (ringkas saat development, ketat saat production):**

- **Dev default (disarankan):** RLS **tetap ON**, tapi policy sederhana agar gak ngeblok workflow.
- **Prod default:** per `org_id`/`event_id` ketat seperti rancangan, tambah policy read-only untuk konten published.

### Template Policy (DEV-First, Simple)

> Terapkan pola ini ke semua tabel dengan FK `event_id` atau `org_id`. Ganti `TABLE_NAME` sesuai kebutuhan.

```sql
-- 0) Nyalakan RLS
alter table public.TABLE_NAME enable row level security;

-- 1) Admin/Owner full access via membership
create policy org_member_select on public.TABLE_NAME
  for select using (
    -- akses bebas untuk konten publik (optional per tabel)
    coalesce((select e.status = 'published' from public.events e where e.id = TABLE_NAME.event_id), false)
    OR exists (
      select 1 from public.org_members m
      where m.user_id = auth.uid()
        and m.org_id = coalesce((select e.org_id from public.events e where e.id = TABLE_NAME.event_id), null)
    )
  );

create policy org_member_modify on public.TABLE_NAME
  for all using (
    exists (
      select 1 from public.org_members m
      where m.user_id = auth.uid()
        and m.org_id = coalesce((select e.org_id from public.events e where e.id = TABLE_NAME.event_id), null)
    )
  ) with check (
    exists (
      select 1 from public.org_members m
      where m.user_id = auth.uid()
        and m.org_id = coalesce((select e.org_id from public.events e where e.id = TABLE_NAME.event_id), null)
    )
  );

-- 2) Single-user (untuk tabel tanpa org, mis. events milik user)
create policy owner_access on public.events
  for all using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

-- 3) Public Read untuk data yang memang publik (themes, event published)
alter table public.themes enable row level security;
create policy themes_public_read on public.themes
  for select using ( true );

-- Optional: Public read konten event yang sudah published (hanya di tabel yang aman dibaca publik)
create policy messages_public_read on public.messages
  for select using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.status = 'published'
    )
  );
```

### Contoh Mapping Cepat

- **events**: `owner_access` (user\_id = auth.uid()); admin/owner org via join `org_members` (jika pakai org).
- **event\_details, schedules, venues, media, guests, rsvps, messages, donations, analytics\_events**: pakai template `org_member_*` (berdasarkan `event_id → events.org_id`).
- **themes**: public read; write hanya admin internal (skip di phase awal, seed saja).

### Mode Development Praktis

- Gunakan **service role** untuk seeding tanpa RLS.
- Untuk debug, tambahkan **policy select** yang longgar sementara:

```sql
-- DEV ONLY (hapus saat prod):
create policy dev_read_all on public.TABLE_NAME for select using ( auth.role() = 'authenticated' );
```

- Pastikan tidak ada `for insert` tanpa `with check` (bisa bocor ownership).

---

## Routing & Perilaku Halaman

- `/` (Landing): SSR; tampilkan 6 tema unggulan, CTA "Pilih Tema" dan "Masuk".
- `/themes`: Grid tema, filter client (warna/gaya/premium). State: `useThemePickerStore`.
- `/themes/[slug]`: Preview tema (RSC). Izinkan input dummy (non-persist) untuk nama & tanggal.
- `/auth/*`: Form client; submit ke route handler; redirect sukses ke `/dashboard/event/new`.
- `/dashboard`: ringkas metrik & status wizard.
- `/dashboard/event/new`: **Wizard** 4 langkah (Core → Theme → Preview → Publish). Draft disimpan di store + autosave debounce (800ms) ke `/api/events`.
- `/dashboard/event/[id]/edit`: Tabs **details/schedule/gallery/rsvp/theme/publish** dengan mutasi via route API.
- `/dashboard/guests`: impor CSV, search, paginate server-side (query params). State lokal untuk filter/selection.
- `/dashboard/analytics`: agregasi server, tombol refresh manual.
- `/[eventSlug]`: Undangan publik (RSC), OG tags benar, opsi musik & buku tamu/RSVP publik.

---

## Kontrak API (contoh)

- `POST /api/events` → `{title, themeId, date, venue...}` → `{id, slug}`
- `PUT /api/events/:id` → partial update
- `POST /api/events/:id/publish` → `{publishAt?}`
- `GET /api/guests?eventId&search=&page=&limit=`
- `POST /api/guests` (bulk CSV) → `{eventId, guests: Array<{name, phone?, email?, segment?}>}`
- `PUT /api/guests/:id`, `DELETE /api/guests/:id`
- `POST /api/media` → upload metadata
- `POST /api/messages` → buku tamu publik (default `approved=false`)
- `POST /api/rsvp` → `{eventSlug|guestToken, status, pax?, note?}`
- `GET /api/analytics?eventId&range=7d`

**Respons error standar:** `{error:{code:string,message:string}}`.

---

## Store Zustand (contoh tipe)

```ts
// /state/useWizardStore.ts
export type WizardStep = 'core'|'theme'|'preview'|'publish';
type CoreData = { title: string; date: string; time: string; tz: string; venue: string; };
export type WizardState = {
  step: WizardStep;
  core: CoreData;
  theme: { themeId?: string; tokens: Record<string,string>; };
  preview: { coupleNames: string; headline?: string; };
  isSaving: boolean;
};
export type WizardActions = {
  setStep: (s: WizardStep) => void;
  updateCore: (p: Partial<CoreData>) => void;
  setTheme: (themeId: string) => void;
  setToken: (k: string, v: string) => void;
  autosave: () => Promise<void>; // call /api/events (debounced)
};
```

Store tambahan: `useThemePickerStore`, `useGuestTableStore`, `useMediaUploaderStore`, `useToastStore`, `useAuthUiStore`.

**Optimistic UI ringan:** update store → panggil API → rollback jika gagal.

---

## Validasi, Keamanan, & Kualitas

- Validasi payload dengan `zod`. Sanitasi pesan/cerita dari HTML berbahaya.
- Rate-limit endpoint publik (`/api/messages`, `/api/rsvp`), captcha ringan opsional.
- `revalidatePath`/`router.refresh()` setelah mutasi untuk sinkronisasi RSC.
- A11y: label form, fokus jelas, tombol besar di mobile.

---

## Acceptance Criteria (ringkas)

- Landing/themes: filter responsif tanpa reload; TTI < 300ms koneksi sedang.
- Auth: daftar ⇒ redirect ke wizard; session persist.
- Wizard: autosave 800ms idle; indikator "Saved" saat sukses; preview sinkron ≤ 1s.
- Guests: CSV 1.000 baris < 10s; paginate server-side; search name/email/phone.
- Gallery: upload batch 10 foto dengan progress; drag-sort & persist urutan.
- Publish: halaman publik `/{slug}` terbit, OG benar; `noindex` toggle berfungsi.
- Tanpa TanStack/SWR: tidak ada import `@tanstack/*` atau `swr`.

---

## Tugas Awal (urutan implementasi)

1. Bootstrap deps (Next.js, Tailwind, shadcn, Zustand, zod, Supabase).
2. Supabase schema + RLS + generate types.
3. Landing + Themes grid + Preview.
4. Auth + session helpers (server & client).
5. Wizard event new (Zustand + autosave).
6. Public invitation page (RSC) + OG.
7. Guests (CSV import, table paginate).
8. Gallery (upload, sort).
9. Messages & RSVP (publik) + moderasi.
10. Analytics dasar.

---


