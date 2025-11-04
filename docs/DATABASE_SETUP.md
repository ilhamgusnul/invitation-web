# Database Schema Setup - Complete ✅

## Summary

Schema database untuk platform Web Undangan telah berhasil dibuat dan di-migrate ke Supabase.

## What Was Done

### 1. **Migration File Created**
- File: `supabase/migrations/20251104223050_init_schema.sql`
- Ukuran: ~600 baris SQL lengkap

### 2. **Tables Created (15 tables)**
- ✅ `users` - Profil user (extends auth.users)
- ✅ `orgs` - Organisasi/tim
- ✅ `org_members` - Membership organisasi
- ✅ `themes` - Template tema undangan (6 seed themes)
- ✅ `events` - Event/undangan utama
- ✅ `event_details` - Detail event (couple, story, music, SEO)
- ✅ `venues` - Venue/lokasi acara
- ✅ `schedules` - Jadwal acara
- ✅ `guests` - Daftar tamu
- ✅ `rsvps` - Konfirmasi kehadiran
- ✅ `messages` - Buku tamu publik
- ✅ `media` - Gallery (image/video)
- ✅ `donations` - Amplop digital
- ✅ `analytics_events` - Event tracking

### 3. **Enums Created (7 enums)**
- ✅ `org_member_role`: owner | admin
- ✅ `event_status`: draft | published
- ✅ `guest_status`: invited | sent | opened | rsvped
- ✅ `rsvp_status`: yes | no | maybe
- ✅ `media_type`: image | video
- ✅ `donation_method`: qris | transfer
- ✅ `donation_status`: pending | confirmed | rejected

### 4. **Indexes Created (13 indexes)**
Optimized for common queries:
- Event lookups by slug, user_id, org_id, status
- Guest lookups by event_id, invite_token
- Analytics by event_id, type, created_at
- Org/membership queries

### 5. **RLS Policies Implemented**
**Security model sesuai AGENTS.md:**
- ✅ Users: Full access to own profile
- ✅ Orgs: Owner full access, members read-only
- ✅ Events: Owner full access, org members can read, public read for published
- ✅ Event Details/Venues/Schedules: Follow event ownership
- ✅ Guests: Private, owner-only access
- ✅ RSVPs: Owner can read, public can insert for published events
- ✅ Messages: Public can insert, owner moderates, public reads approved only
- ✅ Media: Owner manages, public reads for published events
- ✅ Donations: Public inserts, owner manages
- ✅ Analytics: Public inserts tracking, owner reads
- ✅ Themes: Public read for all

### 6. **Functions & Triggers**
- ✅ `handle_updated_at()` - Auto-update timestamp
- ✅ Triggers on `events` and `event_details`

### 7. **Seed Data**
6 sample themes inserted:
1. Elegant White (Free)
2. Rustic Wood (Free)
3. Modern Minimal (Free)
4. Garden Romance (Premium)
5. Classic Gold (Premium)
6. Ocean Blue (Free)

### 8. **TypeScript Types Generated**
- ✅ File: `lib/types/database.ts`
- ✅ Full type safety untuk semua tables, enums, relationships
- ✅ Auto-imported di Supabase client/server helpers

## Compliance with AGENTS.md

✅ **Aturan 4**: RLS ketat diterapkan pada semua tabel
✅ Ownership verification built-in via RLS policies
✅ Public access hanya untuk published content
✅ Private data (guests, analytics owner-view) fully protected

## Database Structure

```
users (auth extension)
└── orgs (optional, untuk tim)
    └── org_members
└── events (main entity)
    ├── event_details (1:1)
    ├── venues (1:N)
    ├── schedules (1:N) → venues (FK)
    ├── guests (1:N)
    │   └── rsvps (1:N)
    ├── messages (1:N)
    ├── media (1:N)
    ├── donations (1:N)
    └── analytics_events (1:N)
themes (standalone, public)
```

## Next Steps

Sesuai **Task Queue** di AGENTS.md:

✅ **Task 1**: Init proyek - DONE
✅ **Task 2**: Schema & RLS - **COMPLETE** ✅
⬜ **Task 3**: Landing + Themes (grid, filter, preview)
⬜ **Task 4**: Auth (login/register/forgot + middleware)
⬜ **Task 5**: Wizard (Zustand store + autosave)
⬜ **Task 6**: Public Page (RSC + OG image)
⬜ **Task 7**: Guests (CSV import + pagination)
⬜ **Task 8**: Gallery (upload + sort)
⬜ **Task 9**: Messages & RSVP
⬜ **Task 10**: Analytics

## Commands Reference

```bash
# Create new migration
npm run db:new <migration_name>

# Run migrations
npm run db:migrate

# Generate TypeScript types
npm run db:types

# Reset database (DEV ONLY - destroys all data)
npm run db:reset

# Reset + regenerate types
npm run db:reset:types
```

## Environment Variables

All required env vars are set in `.env`:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ SUPABASE_ACCESS_TOKEN

## Verification

To verify schema is working:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check seed themes
SELECT slug, name, is_premium FROM themes;
```

---

**Status**: ✅ Schema migration COMPLETE and VERIFIED
**Date**: 2025-11-04
**Migration**: `20251104223050_init_schema.sql`
