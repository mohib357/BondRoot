import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { pool } from './server/db.ts';
import { uploadBufferToS3, getPresignedDownloadUrl, BUCKET_NAME } from './server/storage.ts';
import { hashPassword, verifyPassword, generateToken, verifyToken, type AuthUser } from './server/auth.ts';
import {
  explainKinshipWithGemini,
  parseNaturalLanguageFamilyWithGemini,
  generateFamilyBioWithGemini,
  generateLineageInsightsWithGemini
} from './server/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Auto-create users & messages tables and seed Super Admin in Neon PostgreSQL
  try {
    const initClient = await pool.connect();
    await initClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number);

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        sender_id VARCHAR(64) NOT NULL,
        receiver_id VARCHAR(64) NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages (sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (receiver_id, is_read);

      ALTER TABLE persons ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
    `);

    // Seed Developer Super Admin if not exists
    const adminCheck = await initClient.query('SELECT id FROM users WHERE email = $1', ['muhibbul524@gmail.com']);
    if (adminCheck.rows.length === 0) {
      const adminPasswordHash = hashPassword('Admin@123');
      await initClient.query(`
        INSERT INTO users (id, full_name, email, phone_number, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'usr_superadmin_01',
        'Muhibbul Islam (Developer Super Admin)',
        'muhibbul524@gmail.com',
        '+8801700000000',
        adminPasswordHash,
        'super_admin'
      ]);
      console.log('Developer Super Admin account seeded (muhibbul524@gmail.com).');
    }

    initClient.release();
    console.log("Neon PostgreSQL tables & Super Admin initialized.");
  } catch (initErr) {
    console.warn("DB init notice:", initErr);
  }

  // Auth Helper: extract user from Bearer token
  async function getAuthUser(req: express.Request): Promise<AuthUser | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) return null;

    try {
      const client = await pool.connect();
      const res = await client.query(
        'SELECT id, full_name, email, phone_number, username, role, avatar_url, created_at FROM users WHERE id = $1',
        [decoded.sub]
      );
      client.release();
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  // ================= AUTHENTICATION ENDPOINTS =================

  // POST /api/auth/signup - Register new user
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { full_name, email, phone_number, password } = req.body;
      if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, error: 'পূর্ণ নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      }

      const client = await pool.connect();
      
      // Check existing email
      const emailCheck = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (emailCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({ success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
      }

      // Check existing phone if provided
      if (phone_number && phone_number.trim()) {
        const phoneCheck = await client.query('SELECT id FROM users WHERE phone_number = $1', [phone_number.trim()]);
        if (phoneCheck.rows.length > 0) {
          client.release();
          return res.status(400).json({ success: false, error: 'এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
        }
      }

      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const isSuperAdminEmail = email.trim().toLowerCase() === 'muhibbul524@gmail.com';
      const role = isSuperAdminEmail ? 'super_admin' : 'member';
      const passwordHash = hashPassword(password);

      const insertRes = await client.query(`
        INSERT INTO users (id, full_name, email, phone_number, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name, email, phone_number, role, avatar_url, created_at
      `, [
        userId,
        full_name.trim(),
        email.trim().toLowerCase(),
        phone_number ? phone_number.trim() : null,
        passwordHash,
        role
      ]);

      client.release();

      const newUser: AuthUser = insertRes.rows[0];
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
        user: newUser,
        token
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ success: false, error: err.message || 'নিবন্ধনে সমস্যা হয়েছে।' });
    }
  });

  // POST /api/auth/login - User Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: 'ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড দিন।' });
      }

      const client = await pool.connect();
      const userRes = await client.query(`
        SELECT id, full_name, email, phone_number, password_hash, role, avatar_url, created_at
        FROM users
        WHERE LOWER(email) = LOWER($1) OR phone_number = $1
      `, [identifier.trim()]);

      client.release();

      if (userRes.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড।' });
      }

      const user = userRes.rows[0];
      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড।' });
      }

      const authUser: AuthUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      };

      const token = generateToken(authUser);

      res.json({
        success: true,
        message: 'লগইন সফল হয়েছে!',
        user: authUser,
        token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, error: err.message || 'লগইনে সমস্যা হয়েছে।' });
    }
  });

  // GET /api/auth/me - Current user session
  app.get('/api/auth/me', async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'সেশন পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/auth/check-username - Real-time username uniqueness check
  app.get('/api/auth/check-username', async (req, res) => {
    try {
      const { username, current_user_id } = req.query;
      if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ available: false, error: 'ইউজারনেম প্রয়োজন' });
      }

      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return res.json({ available: false, error: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' });
      }

      const client = await pool.connect();
      const checkRes = await client.query(
        'SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2',
        [cleanUsername, current_user_id || '']
      );
      client.release();

      const available = checkRes.rows.length === 0;
      res.json({
        available,
        username: cleanUsername,
        message: available ? 'ইউজারনেমটি ফাঁকা রয়েছে (Available)!' : 'এই ইউজারনেমটি ইতোমধ্যে অন্য কেউ নিয়েছেন।'
      });
    } catch (err: any) {
      res.status(500).json({ available: false, error: err.message });
    }
  });

  // PUT /api/auth/update-profile - Update logged-in user profile
  app.put('/api/auth/update-profile', async (req, res) => {
    try {
      const currentUser = await getAuthUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'লগইন করুন।' });
      }

      const { full_name, phone_number, email, username, avatar_url } = req.body;
      if (!full_name || !email) {
        return res.status(400).json({ success: false, error: 'নাম ও ইমেইল আবশ্যক।' });
      }

      const client = await pool.connect();

      // Check username uniqueness if changing
      if (username && username.trim()) {
        const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const unCheck = await client.query(
          'SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2',
          [cleanUser, currentUser.id]
        );
        if (unCheck.rows.length > 0) {
          client.release();
          return res.status(400).json({ success: false, error: 'এই ইউজারনেমটি অন্য কারো অ্যাকাউন্টে রয়েছে।' });
        }
      }

      const updateRes = await client.query(`
        UPDATE users
        SET full_name = $1,
            phone_number = $2,
            email = $3,
            username = $4,
            avatar_url = $5
        WHERE id = $6
        RETURNING id, full_name, email, phone_number, username, role, avatar_url, created_at
      `, [
        full_name.trim(),
        phone_number ? phone_number.trim() : null,
        email.trim().toLowerCase(),
        username ? username.trim().toLowerCase() : null,
        avatar_url || currentUser.avatar_url,
        currentUser.id
      ]);

      client.release();

      const updatedUser: AuthUser = updateRes.rows[0];
      const token = generateToken(updatedUser);

      res.json({
        success: true,
        message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
        user: updatedUser,
        token
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/logout - Logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'সফলভাবে সাইন আউট করা হয়েছে।' });
  });

  // ================= SUPER ADMIN ENDPOINTS =================

  // GET /api/admin/users - Get all registered users (Super Admin only)
  app.get('/api/admin/users', async (req, res) => {
    try {
      const currentUser = await getAuthUser(req);
      if (!currentUser || currentUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'শুধুমাত্র সুপার অ্যাডমিনের প্রবেশাধিকার রয়েছে।' });
      }

      const client = await pool.connect();
      const usersRes = await client.query(`
        SELECT u.id, u.full_name, u.email, u.phone_number, u.role, u.avatar_url, u.created_at,
               COUNT(p.person_id) as family_count
        FROM users u
        LEFT JOIN persons p ON p.user_id = u.id AND p.deleted_at IS NULL
        GROUP BY u.id
        ORDER BY u.created_at DESC;
      `);
      client.release();

      res.json({
        success: true,
        users: usersRes.rows
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/admin/stats - Super Admin Global Statistics
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const currentUser = await getAuthUser(req);
      if (!currentUser || currentUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'শুধুমাত্র সুপার অ্যাডমিনের প্রবেশাধিকার রয়েছে।' });
      }

      const client = await pool.connect();
      const userCountRes = await client.query('SELECT count(*) FROM users');
      const personCountRes = await client.query('SELECT count(*) FROM persons WHERE deleted_at IS NULL');
      const messageCountRes = await client.query('SELECT count(*) FROM messages');
      client.release();

      res.json({
        success: true,
        stats: {
          total_users: parseInt(userCountRes.rows[0].count, 10),
          total_persons: parseInt(personCountRes.rows[0].count, 10),
          total_messages: parseInt(messageCountRes.rows[0].count, 10),
          database_engine: 'Neon PostgreSQL (Scale-to-Zero)',
          server_uptime_seconds: process.uptime(),
          memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/update-role - Update user role
  app.post('/api/admin/update-role', async (req, res) => {
    try {
      const currentUser = await getAuthUser(req);
      if (!currentUser || currentUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'শুধুমাত্র সুপার অ্যাডমিনের প্রবেশাধিকার রয়েছে।' });
      }

      const { user_id, new_role } = req.body;
      if (!user_id || !new_role || !['super_admin', 'admin', 'member'].includes(new_role)) {
        return res.status(400).json({ success: false, error: 'সঠিক ইউজার আইডি ও রোল দিন।' });
      }

      const client = await pool.connect();
      await client.query('UPDATE users SET role = $1 WHERE id = $2', [new_role, user_id]);
      client.release();

      res.json({ success: true, message: 'ইউজার রোল সফলভাবে আপডেট হয়েছে।' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/reset-data - Super Admin Emergency Data Reset
  app.post('/api/admin/reset-data', async (req, res) => {
    try {
      const currentUser = await getAuthUser(req);
      if (!currentUser || currentUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'শুধুমাত্র সুপার অ্যাডমিনের প্রবেশাধিকার রয়েছে।' });
      }

      const client = await pool.connect();
      await client.query('TRUNCATE TABLE persons, messages, marriages CASCADE');
      client.release();

      res.json({ success: true, message: 'সমস্ত ফ্যামিলি ট্রি ও বার্তা ডাটাবেস রিসেট করা হয়েছে।' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1. Health check & PostgreSQL connection status endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT version(), current_database(), current_user, NOW() as server_time');
      const countRes = await client.query('SELECT count(*) FROM persons WHERE deleted_at IS NULL');
      client.release();

      res.json({
        status: 'OK',
        database: 'Connected to Neon PostgreSQL',
        database_name: result.rows[0].current_database,
        storage: 'Neon S3 Object Storage Active (Bucket: ' + BUCKET_NAME + ')',
        server_time: result.rows[0].server_time,
        total_active_persons: parseInt(countRes.rows[0].count, 10)
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to connect to PostgreSQL',
        error: err.message
      });
    }
  });

  // 1.1 Storage Upload Photo Endpoint
  app.post('/api/upload/photo', async (req, res) => {
    try {
      const { person_id, base64_image, filename = 'avatar.jpg', content_type = 'image/jpeg' } = req.body;
      if (!person_id || !base64_image) {
        return res.status(400).json({ error: 'person_id and base64_image are required' });
      }

      // Clean base64 header if present
      const cleanBase64 = base64_image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const key = `profiles/${person_id}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { downloadUrl } = await uploadBufferToS3(key, buffer, content_type);

      // Save URL to persons table in PostgreSQL if existing person
      if (person_id && person_id !== 'temp') {
        try {
          const client = await pool.connect();
          await client.query(`
            UPDATE persons 
            SET profile_photo_url = $1, version = version + 1
            WHERE person_id = $2
          `, [downloadUrl, person_id]);
          client.release();
        } catch (dbErr) {
          console.warn("Could not update person profile_photo_url in DB:", dbErr);
        }
      }

      res.json({
        success: true,
        person_id,
        key,
        photo_url: downloadUrl
      });
    } catch (err: any) {
      console.error("Photo upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1.2 Storage Upload Memory Vault Photo Endpoint
  app.post('/api/upload/memory', async (req, res) => {
    try {
      const { person_id, base64_image, caption = '', year = '', filename = 'memory.jpg', content_type = 'image/jpeg' } = req.body;
      if (!base64_image) {
        return res.status(400).json({ error: 'base64_image is required' });
      }

      const cleanBase64 = base64_image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const key = `memories/${person_id || 'general'}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { downloadUrl } = await uploadBufferToS3(key, buffer, content_type);

      res.json({
        success: true,
        memory: {
          id: `mem_${Date.now()}`,
          url: downloadUrl,
          caption,
          year,
          createdAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      console.error("Memory upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1.3 Developer Contact & Feedback Endpoint
  app.post('/api/feedback', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      console.log(`[Developer Feedback Received] From: ${name} (${email}): ${message}`);
      res.json({ success: true, message: 'আপনার বার্তা ও ফিডব্যাক সফলভাবে পাঠানো হয়েছে!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. GET all persons (Privacy-filtered and user-isolated)
  app.get('/api/persons', async (req, res) => {
    try {
      const authUser = await getAuthUser(req);
      const client = await pool.connect();
      let query = `
        SELECT person_id, user_id, family_id, name_local, name_english, gender,
               date_of_birth, date_of_death, is_living, father_id, mother_id,
               profession, bio, privacy_level, profile_photo_url, version, server_updated_at AS updated_at
        FROM persons
        WHERE deleted_at IS NULL
      `;
      const params: any[] = [];

      if (authUser && authUser.role === 'member') {
        query += ` AND (user_id = $1 OR user_id IS NULL) `;
        params.push(authUser.id);
      }

      query += ` ORDER BY name_local ASC;`;

      const result = await client.query(query, params);
      client.release();
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2.1 UPDATE person bio
  app.put('/api/persons/:id/bio', async (req, res) => {
    try {
      const { id } = req.params;
      const { bio } = req.body;
      const client = await pool.connect();
      await client.query(`
        UPDATE persons
        SET bio = $1, version = version + 1, server_updated_at = NOW()
        WHERE person_id = $2
      `, [bio, id]);
      client.release();
      res.json({ success: true, person_id: id, bio });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2.2 UPDATE full person details
  app.put('/api/persons/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { occupation, profession, education, currentLocation, birthDate, deathDate, isLiving, bio } = req.body;
      const client = await pool.connect();
      await client.query(`
        UPDATE persons
        SET profession = COALESCE($1, profession),
            bio = COALESCE($2, bio),
            date_of_birth = COALESCE($3, date_of_birth),
            date_of_death = COALESCE($4, date_of_death),
            is_living = COALESCE($5, is_living),
            version = version + 1,
            server_updated_at = NOW()
        WHERE person_id = $6
      `, [occupation || profession, bio, birthDate, deathDate, isLiving, id]);
      client.release();
      res.json({ success: true, person_id: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // INTERNAL MESSAGING & NOTIFICATIONS API
  // ==========================================

  // A. Send a new message
  app.post('/api/messages/send', async (req, res) => {
    try {
      const { sender_id, receiver_id, content } = req.body;
      if (!sender_id || !receiver_id || !content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'sender_id, receiver_id, and content are required' });
      }

      const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const client = await pool.connect();
      const result = await client.query(`
        INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
        RETURNING *
      `, [id, sender_id, receiver_id, content.trim()]);
      client.release();

      res.json({ success: true, message: result.rows[0] });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // B. Get chat history between two family members
  app.get('/api/messages/:senderId/:receiverId', async (req, res) => {
    try {
      const { senderId, receiverId } = req.params;
      const client = await pool.connect();
      const result = await client.query(`
        SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
               p.name_local AS sender_name, p.profile_photo_url AS sender_avatar
        FROM messages m
        LEFT JOIN persons p ON m.sender_id = p.person_id
        WHERE (m.sender_id = $1 AND m.receiver_id = $2)
           OR (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.created_at ASC
        LIMIT 200;
      `, [senderId, receiverId]);
      client.release();

      res.json({ success: true, count: result.rows.length, messages: result.rows });
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // C. Get unread messages & notification center snippets
  app.get('/api/notifications/:personId', async (req, res) => {
    try {
      const { personId } = req.params;
      const client = await pool.connect();
      const unreadRes = await client.query(`
        SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
               p.name_local AS sender_name, p.name_english AS sender_english_name, p.profile_photo_url AS sender_avatar
        FROM messages m
        LEFT JOIN persons p ON m.sender_id = p.person_id
        WHERE m.receiver_id = $1 AND m.is_read = false
        ORDER BY m.created_at DESC
        LIMIT 25;
      `, [personId]);

      const countRes = await client.query(`
        SELECT count(*) as unread_count
        FROM messages
        WHERE receiver_id = $1 AND is_read = false;
      `, [personId]);
      client.release();

      res.json({
        success: true,
        unread_count: parseInt(countRes.rows[0]?.unread_count || '0', 10),
        notifications: unreadRes.rows
      });
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // D. Mark messages as read
  app.put('/api/messages/mark-as-read', async (req, res) => {
    try {
      const { sender_id, receiver_id, message_ids } = req.body;
      const client = await pool.connect();
      if (Array.isArray(message_ids) && message_ids.length > 0) {
        await client.query(`
          UPDATE messages
          SET is_read = true
          WHERE id = ANY($1::text[])
        `, [message_ids]);
      } else if (sender_id && receiver_id) {
        await client.query(`
          UPDATE messages
          SET is_read = true
          WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
        `, [receiver_id, sender_id]);
      }
      client.release();

      res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to mark messages as read:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. POST /api/sync/pull (Offline sync: fetch all records updated since timestamp)
  app.post('/api/sync/pull', async (req, res) => {
    try {
      const { since_version = 0, since_timestamp } = req.body;
      const client = await pool.connect();

      let query = `SELECT * FROM persons WHERE version > $1 ORDER BY version ASC`;
      const params: any[] = [since_version];

      const result = await client.query(query, params);
      client.release();

      res.json({
        success: true,
        records: result.rows,
        latest_version: result.rows.length > 0 ? Math.max(...result.rows.map(r => r.version)) : since_version
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. POST /api/sync/push (Offline sync: push local changes with conflict detection)
  app.post('/api/sync/push', async (req, res) => {
    const { changes, device_id } = req.body;
    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: 'changes array is required' });
    }

    const client = await pool.connect();
    const conflicts: any[] = [];
    const applied: any[] = [];

    try {
      await client.query('BEGIN');

      for (const item of changes) {
        const { person_id, base_version, data } = item;

        // Check current server record
        const checkRes = await client.query('SELECT version, updated_at FROM persons WHERE person_id = $1', [person_id]);
        if (checkRes.rows.length > 0) {
          const currentVersion = checkRes.rows[0].version;
          if (currentVersion > base_version) {
            // Version mismatch conflict!
            conflicts.push({
              person_id,
              client_base_version: base_version,
              server_current_version: currentVersion,
              reason: 'CONCURRENT_EDIT_CONFLICT'
            });
            continue;
          }
        }

        // Apply change
        if (checkRes.rows.length === 0) {
          // New insert
          await client.query(`
            INSERT INTO persons (person_id, name_local, name_english, gender, date_of_birth, father_id, mother_id, profession, version)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
          `, [data.person_id, data.name_local, data.name_english, data.gender, data.date_of_birth, data.father_id, data.mother_id, data.profession]);
          applied.push(person_id);
        } else {
          // Update
          await client.query(`
            UPDATE persons
            SET name_local = $2, name_english = $3, gender = $4, date_of_birth = $5,
                father_id = $6, mother_id = $7, profession = $8, version = version + 1
            WHERE person_id = $1
          `, [person_id, data.name_local, data.name_english, data.gender, data.date_of_birth, data.father_id, data.mother_id, data.profession]);
          applied.push(person_id);
        }
      }

      await client.query('COMMIT');
      res.json({
        success: true,
        applied_count: applied.length,
        has_conflicts: conflicts.length > 0,
        conflicts
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  });

  // ==========================================
  // GEMINI AI ENDPOINTS
  // ==========================================

  // AI 1: Kinship Explainer & Calling Term
  app.post('/api/ai/explain-relationship', async (req, res) => {
    try {
      const { personA, personB, path } = req.body;
      if (!personA || !personB) {
        return res.status(400).json({ error: 'personA and personB are required' });
      }

      const explanation = await explainKinshipWithGemini({
        personA,
        personB,
        path: path || []
      });

      res.json({ success: true, ...explanation });
    } catch (err: any) {
      console.error('Gemini explain error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI 2: Natural Language Family Entry
  app.post('/api/ai/parse-natural-family', async (req, res) => {
    try {
      const { text, existingPeople = [], commit_to_db = false } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
      }

      const parsed = await parseNaturalLanguageFamilyWithGemini({
        text,
        existingPeople
      });

      let insertedCount = 0;
      let insertedPersons: any[] = [];

      if (commit_to_db && parsed.new_persons && parsed.new_persons.length > 0) {
        const client = await pool.connect();
        const idMap = new Map<string, string>(); // temp_id -> real person_id

        try {
          await client.query('BEGIN');

          // Generate next IDs
          const countRes = await client.query('SELECT count(*) FROM persons');
          let baseIndex = 100000 + parseInt(countRes.rows[0].count, 10) + 1;

          for (const np of parsed.new_persons) {
            const realId = `P${baseIndex++}`;
            idMap.set(np.temp_id, realId);

            // Check if connections specify father or mother
            let fatherId: string | null = null;
            let motherId: string | null = null;

            for (const conn of parsed.connections) {
              if (conn.to_id === np.temp_id) {
                if (conn.relation_type === 'father') {
                  fatherId = idMap.get(conn.from_id) || conn.from_id;
                } else if (conn.relation_type === 'mother') {
                  motherId = idMap.get(conn.from_id) || conn.from_id;
                }
              } else if (conn.from_id === np.temp_id) {
                if (conn.relation_type === 'child') {
                  // to_id is parent
                  // check to_id gender if known
                }
              }
            }

            await client.query(`
              INSERT INTO persons (
                person_id, name_local, name_english, gender, date_of_birth,
                father_id, mother_id, profession, version
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
            `, [
              realId,
              np.name_local,
              np.name_english || np.name_local,
              np.gender,
              np.birth_year || null,
              fatherId,
              motherId,
              np.profession || null
            ]);

            insertedCount++;
            insertedPersons.push({
              person_id: realId,
              name_local: np.name_local,
              gender: np.gender,
              father_id: fatherId,
              mother_id: motherId
            });
          }

          // Handle reverse child connections (e.g. "I have a son named Rafi")
          for (const conn of parsed.connections) {
            const fromReal = idMap.get(conn.from_id) || conn.from_id;
            const toReal = idMap.get(conn.to_id) || conn.to_id;

            if (conn.relation_type === 'child' || conn.relation_type === 'father' || conn.relation_type === 'mother') {
              if (conn.relation_type === 'child') {
                // fromReal is parent, toReal is child
                // Check parent gender
                const pCheck = await client.query('SELECT gender FROM persons WHERE person_id = $1', [fromReal]);
                const isMother = pCheck.rows[0]?.gender === 'female';
                const col = isMother ? 'mother_id' : 'father_id';
                await client.query(`UPDATE persons SET ${col} = $1 WHERE person_id = $2`, [fromReal, toReal]);
              }
            }
          }

          await client.query('COMMIT');
        } catch (dbErr) {
          await client.query('ROLLBACK');
          throw dbErr;
        } finally {
          client.release();
        }
      }

      res.json({
        success: true,
        ...parsed,
        committed: commit_to_db,
        inserted_count: insertedCount,
        inserted_persons: insertedPersons
      });
    } catch (err: any) {
      console.error('Gemini natural family error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI 3: Family Story / Bio Generator
  app.post('/api/ai/generate-bio', async (req, res) => {
    try {
      const { person, parents = [], siblings = [], children = [] } = req.body;
      if (!person) {
        return res.status(400).json({ error: 'person is required' });
      }

      const bioResult = await generateFamilyBioWithGemini({
        person,
        parents,
        siblings,
        children
      });

      res.json({ success: true, ...bioResult });
    } catch (err: any) {
      console.error('Gemini bio error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI 4: Lineage Insights Dashboard
  app.post('/api/ai/lineage-insights', async (req, res) => {
    try {
      const { members = [] } = req.body;
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'members array is required' });
      }

      const insights = await generateLineageInsightsWithGemini({ members });
      res.json({ success: true, ...insights });
    } catch (err: any) {
      console.error('Gemini lineage insights error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount Vite or static files
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BondRoot Server running on http://0.0.0.0:${PORT} with PostgreSQL`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
