import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mE3u5vzkpAxB@ep-green-dust-b3runsco-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
