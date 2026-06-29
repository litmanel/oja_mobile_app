import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: '../../.env' });

const isDryRun = process.argv.includes('--dry-run');

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  if (isDryRun) {
    console.log('Dry run mode enabled: migrations will not be executed.');
    await sql.end();
    process.exit(0);
  }

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: resolve(__dirname, '../migrations') });
  console.log('Migrations complete!');

  await sql.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
