import { createAdminClient } from '../src/lib/supabase/admin';
import * as fs from 'fs';
import * as path from 'path';

const adminClient = createAdminClient();

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations/001_create_books.sql'),
      'utf-8'
    );

    const { error } = await adminClient.rpc('run_sql', { sql });
    if (error) throw error;
    console.log('✓ Migration complete');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

runMigration();
