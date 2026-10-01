import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mE3u5vzkpAxB@ep-green-dust-b3runsco.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

console.log("Connecting to Neon PostgreSQL...");

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("✓ Connected successfully to Neon PostgreSQL!");

    const verRes = await client.query('SELECT version(), current_database(), current_user');
    console.log("Database info:", verRes.rows[0]);

    // 1. Read and apply schema
    console.log("Applying /database/postgresql_schema.sql schema...");
    const schemaSql = fs.readFileSync(path.resolve('./database/postgresql_schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log("✓ Schema applied successfully!");

    // 2. Seed initial Master Family if not exists
    console.log("Verifying seed data...");
    const checkUser = await client.query("SELECT * FROM users WHERE email = 'muhib@bondroot.com'");
    let userId: string;
    if (checkUser.rows.length === 0) {
      const uRes = await client.query(`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ('muhib@bondroot.com', '$argon2id$v=19$m=65536,t=3,p=4$bondroot_secure_hash', 'মুহিব (Muhib)', 'SUPER_ADMIN')
        RETURNING user_id;
      `);
      userId = uRes.rows[0].user_id;
      console.log("✓ Created admin user with ID:", userId);
    } else {
      userId = checkUser.rows[0].user_id;
      console.log("✓ Admin user exists:", userId);
    }

    const checkFamily = await client.query("SELECT * FROM families WHERE family_name = 'Arz Uddin Lineage'");
    let familyId: string;
    if (checkFamily.rows.length === 0) {
      const fRes = await client.query(`
        INSERT INTO families (family_name, root_ancestor_person_id, created_by_user_id)
        VALUES ('Arz Uddin Lineage', 'P100000', $1)
        RETURNING family_id;
      `, [userId]);
      familyId = fRes.rows[0].family_id;
      console.log("✓ Created family record with ID:", familyId);
    } else {
      familyId = checkFamily.rows[0].family_id;
      console.log("✓ Family record exists:", familyId);
    }

    // Seed master family members
    const personsData = [
      { id: 'P100000', nameLocal: 'আরজ উদ্দিন', nameEnglish: 'Arz Uddin', gender: 'male', dob: '1910', father: null },
      { id: 'P100001', nameLocal: 'মোহাম্মদ আলী', nameEnglish: 'Mohammad Ali', gender: 'male', dob: '1938', father: 'P100000' },
      { id: 'P100002', nameLocal: 'মোহাম্মদ আলীর ভাই', nameEnglish: 'Brother of Mohammad Ali', gender: 'male', dob: '1942', father: 'P100000' },
      { id: 'P100003', nameLocal: 'মোঃ ইদ্রিস আলী', nameEnglish: 'Md. Idris Ali', gender: 'male', dob: '1968', father: 'P100001' },
      { id: 'P100004', nameLocal: 'আজিজুল হক (দাদার ভাইয়ের ছেলে)', nameEnglish: 'Azizul Hoque (Grandfather Brother Son)', gender: 'male', dob: '1972', father: 'P100002' },
      { id: 'P100005', nameLocal: 'মুহিব', nameEnglish: 'Muhib', gender: 'male', dob: '1998', father: 'P100003', profession: 'Software Engineer', email: 'muhib@bondroot.com' },
      { id: 'P100006', nameLocal: 'কামাল হোসেন (দাদার ভাইয়ের ছেলের ছেলে)', nameEnglish: 'Kamal Hossain (Grandfather Brother Son Son)', gender: 'male', dob: '2002', father: 'P100004' }
    ];

    for (const p of personsData) {
      const pCheck = await client.query('SELECT person_id FROM persons WHERE person_id = $1', [p.id]);
      if (pCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO persons (person_id, family_id, created_by_user_id, name_local, name_english, gender, date_of_birth, father_id, profession, email, privacy_level)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'FAMILY')
        `, [p.id, familyId, userId, p.nameLocal, p.nameEnglish, p.gender, p.dob, p.father, p.profession || null, p.email || null]);
        console.log(`✓ Inserted person ${p.id} (${p.nameLocal})`);
      }
    }

    // 3. Query overview
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("\nTables created in Neon database:", tablesRes.rows.map(r => r.table_name));

    const personCount = await client.query('SELECT count(*) FROM persons');
    console.log("Total persons in PostgreSQL:", personCount.rows[0].count);

    console.log("\n🎉 NEON POSTGRESQL INITIALIZATION & MIGRATION COMPLETE! 🎉");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
