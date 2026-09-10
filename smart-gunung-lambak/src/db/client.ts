import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(connectionString);

const pool = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export async function closeDatabase() {
  await pool?.end();
}
