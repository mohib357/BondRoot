-- =====================================================================
-- BondRoot Production PostgreSQL Database Schema
-- Standard: PostgreSQL 15+ / Cloud SQL Developer & Enterprise Ready
-- Supports: Family Graph Kinship, Multi-tenant Families, Soft-Delete,
--           Offline Sync, Tamper-resistant Audit Trails, and Future Spouses
-- =====================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerations & Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'FAMILY_ADMIN', 'MEMBER', 'GUEST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE privacy_type AS ENUM ('PUBLIC', 'FAMILY', 'PRIVATE_RESTRICTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'SOFT_DELETE', 'RESTORE', 'MERGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id or bcrypt (Never plaintext)
    full_name VARCHAR(255),
    role user_role DEFAULT 'MEMBER',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Families Table (Multi-tenancy / Family Trees)
CREATE TABLE IF NOT EXISTS families (
    family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name VARCHAR(255) NOT NULL,
    root_ancestor_person_id VARCHAR(50),
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Family Memberships (RBAC & Sharing)
CREATE TABLE IF NOT EXISTS family_memberships (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    linked_person_id VARCHAR(50),
    role user_role DEFAULT 'MEMBER',
    can_edit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- 6. Persons Table (Core Family Graph Nodes)
-- Identity rule: person_id is unique, names are NEVER unique identities.
CREATE TABLE IF NOT EXISTS persons (
    person_id VARCHAR(50) PRIMARY KEY, -- Matches Android client ID e.g. 'P100005'
    family_id UUID REFERENCES families(family_id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,

    -- Localized Names
    name_local VARCHAR(255) NOT NULL,
    name_english VARCHAR(255) NOT NULL,
    gender gender_type DEFAULT 'unknown',

    -- Vital Statistics
    date_of_birth VARCHAR(50), -- Supports partial years (e.g. '1942') or ISO dates
    date_of_death VARCHAR(50),
    is_living BOOLEAN DEFAULT TRUE,

    -- Directed Kinship References
    father_id VARCHAR(50) REFERENCES persons(person_id) ON DELETE RESTRICT,
    mother_id VARCHAR(50) REFERENCES persons(person_id) ON DELETE RESTRICT,

    -- Professional & Social Data
    profession VARCHAR(255),
    email VARCHAR(255),
    facebook VARCHAR(255),
    other_social TEXT,
    profile_photo_url TEXT,

    -- Privacy & Visibility Controls
    privacy_level privacy_type DEFAULT 'FAMILY',

    -- Offline-First Sync & Optimistic Concurrency Control
    version INT NOT NULL DEFAULT 1,
    client_created_at BIGINT,
    client_updated_at BIGINT,
    server_updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL, -- Soft delete timestamp

    -- Database Integrity Constraints
    CONSTRAINT chk_no_self_father CHECK (person_id != father_id),
    CONSTRAINT chk_no_self_mother CHECK (person_id != mother_id)
);

-- 7. Marriages Table (Future-ready Spouse Relationships)
CREATE TABLE IF NOT EXISTS marriages (
    marriage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(family_id) ON DELETE CASCADE,
    spouse_a_id VARCHAR(50) NOT NULL REFERENCES persons(person_id) ON DELETE RESTRICT,
    spouse_b_id VARCHAR(50) NOT NULL REFERENCES persons(person_id) ON DELETE RESTRICT,
    marriage_date VARCHAR(50),
    divorce_date VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_different_spouses CHECK (spouse_a_id != spouse_b_id)
);

-- 8. Audit Trail (Tamper-Resistant Change History)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    family_id UUID REFERENCES families(family_id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'PERSON', 'RELATIONSHIP', 'MARRIAGE'
    entity_id VARCHAR(50) NOT NULL,
    action audit_action NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    client_ip VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Offline Sync Queue / Batches
CREATE TABLE IF NOT EXISTS sync_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    batch_version INT NOT NULL,
    records_applied INT DEFAULT 0,
    has_conflicts BOOLEAN DEFAULT FALSE,
    conflict_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_persons_family ON persons(family_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_persons_father ON persons(father_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_persons_mother ON persons(mother_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_persons_names ON persons(name_local, name_english) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_persons_deleted_at ON persons(deleted_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_marriages_spouses ON marriages(spouse_a_id, spouse_b_id);

-- 11. Automated Updated At Trigger Function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_persons
BEFORE UPDATE ON persons
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
