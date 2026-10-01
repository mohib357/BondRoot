import pg from 'pg';

const { Pool } = pg;

const rawConnectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!rawConnectionString) {
  console.error('FATAL: DATABASE_URL or DATABASE_URL_POOLED environment variable is not set.');
  process.exit(1);
}

// Explicitly set sslmode=verify-full to suppress pg v9 deprecation warning
// and maintain current secure behavior going forward
const connectionString = rawConnectionString.includes('sslmode=')
  ? rawConnectionString.replace(/sslmode=[^&]+/, 'sslmode=verify-full')
  : rawConnectionString + '&sslmode=verify-full';

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
