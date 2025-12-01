-- IMS Database Schema
-- Installation Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM Types
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'installer');

CREATE TYPE installation_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- =====================================================
-- Tables
-- =====================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  company_details TEXT,
  role user_role NOT NULL DEFAULT 'installer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installations table
CREATE TABLE installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  installation_type TEXT NOT NULL,
  notes TEXT,
  status installation_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_installations_assigned_to ON installations(assigned_to);
CREATE INDEX idx_installations_status ON installations(status);
CREATE INDEX idx_installations_created_by ON installations(created_by);
CREATE INDEX idx_installations_archived ON installations(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_materials_installation_id ON materials(installation_id);

-- =====================================================
-- Views
-- =====================================================

CREATE VIEW active_installations AS
SELECT *
FROM installations
WHERE archived_at IS NULL;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger to set completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION handle_installation_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;

  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_installation_completed
  BEFORE UPDATE ON installations
  FOR EACH ROW
  EXECUTE FUNCTION handle_installation_completed();

-- =====================================================
-- RLS Helper Functions
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies - Users table
-- =====================================================

-- Admin: full access to users
CREATE POLICY admin_full_access_users
  ON users
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Installer: read own user
CREATE POLICY installer_read_own_user
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Installer: update own user (except role)
CREATE POLICY installer_update_own_user
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- =====================================================
-- RLS Policies - Installations table
-- =====================================================

-- Admin: full access to installations
CREATE POLICY admin_full_access_installations
  ON installations
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Installer: read own installations
CREATE POLICY installer_read_own_installations
  ON installations
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

-- Installer: update own installations (limited fields)
CREATE POLICY installer_update_own_installations
  ON installations
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (
    assigned_to = auth.uid()
    AND status != 'cancelled'
  );

-- =====================================================
-- RLS Policies - Materials table
-- =====================================================

-- Admin: full access to materials
CREATE POLICY admin_full_access_materials
  ON materials
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Installer: read materials from own installations
CREATE POLICY installer_read_own_materials
  ON materials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM installations
      WHERE installations.id = materials.installation_id
      AND installations.assigned_to = auth.uid()
    )
  );

-- Installer: insert materials to own installations
CREATE POLICY installer_insert_own_materials
  ON materials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM installations
      WHERE installations.id = materials.installation_id
      AND installations.assigned_to = auth.uid()
    )
  );

-- Installer: update materials from own installations
CREATE POLICY installer_update_own_materials
  ON materials
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM installations
      WHERE installations.id = materials.installation_id
      AND installations.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM installations
      WHERE installations.id = materials.installation_id
      AND installations.assigned_to = auth.uid()
    )
  );

-- Installer: delete materials from own installations
CREATE POLICY installer_delete_own_materials
  ON materials
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM installations
      WHERE installations.id = materials.installation_id
      AND installations.assigned_to = auth.uid()
    )
  );
