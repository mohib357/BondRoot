import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL or DATABASE_URL_POOLED environment variable is not set.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool tuning
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
