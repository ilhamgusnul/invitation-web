/**
 * Quick verification script to check database schema
 * Run: npm run db:verify
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/types/database.js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n');

  try {
    // 1. Check themes
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('slug, name, is_premium')
      .order('name');

    if (themesError) throw themesError;

    console.log('✅ Themes table:');
    console.table(themes);

    // 2. Check if tables exist by querying each
    const tables: Array<keyof Database['public']['Tables']> = [
      'users',
      'orgs',
      'org_members',
      'events',
      'event_details',
      'venues',
      'schedules',
      'guests',
      'rsvps',
      'messages',
      'media',
      'donations',
      'analytics_events',
    ];

    console.log('\n✅ Table accessibility check:');
    for (const table of tables) {
      // org_members and event_details don't have 'id' column, use different select
      const selectColumn = table === 'org_members' ? 'org_id' : table === 'event_details' ? 'event_id' : 'id';
      const { error } = await supabase.from(table).select(selectColumn).limit(1);
      const status = error ? '❌' : '✅';
      console.log(`${status} ${table}`);
    }

    console.log('\n🎉 Schema verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifySchema();
