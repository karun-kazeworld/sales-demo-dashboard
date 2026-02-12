-- Supabase-optimized schema
-- Note: Supabase provides auth.users table automatically

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product VARCHAR(100) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  brand VARCHAR(50) UNIQUE NOT NULL,
  schema_definition JSONB NOT NULL,
  ui_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (references Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('executive', 'supervisor', 'admin')),
  domain VARCHAR(50), -- Domain assignment (Banking, Automotive, etc.)
  supervisor_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_supervisor_domain CHECK (
    role != 'supervisor' OR domain IS NOT NULL
  ),
  CONSTRAINT valid_executive_supervisor CHECK (
    role != 'executive' OR supervisor_id IS NOT NULL
  )
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) NOT NULL,
  executive_id UUID REFERENCES user_profiles(id) NOT NULL,
  transcript TEXT NOT NULL,
  conversation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  analysis_result JSONB NOT NULL,
  total_score DECIMAL(5,2),
  status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo analyses (for Castrol-type products)
CREATE TABLE photo_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_product_executive ON conversations(product_id, executive_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_score ON conversations(total_score DESC);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_supervisor ON user_profiles(supervisor_id);
CREATE INDEX idx_user_profiles_domain ON user_profiles(domain);
CREATE INDEX idx_products_domain ON products(domain);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Allow authenticated users to read all user_profiles" ON user_profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to insert user_profiles" ON user_profiles
FOR INSERT TO authenticated WITH CHECK (auth.email() = 'admin@demo.com');

CREATE POLICY "Allow admin to update user_profiles" ON user_profiles
FOR UPDATE TO authenticated USING (auth.email() = 'admin@demo.com') WITH CHECK (auth.email() = 'admin@demo.com');

-- RLS Policies for conversations (simplified to avoid recursion)
CREATE POLICY "Allow authenticated users to read conversations" ON conversations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert conversations" ON conversations
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conversations" ON conversations
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for products (all authenticated users can read)
CREATE POLICY "Authenticated users can view products" ON products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to insert products" ON products
FOR INSERT TO authenticated WITH CHECK (auth.email() = 'admin@demo.com');

CREATE POLICY "Allow admin to update products" ON products
FOR UPDATE TO authenticated USING (auth.email() = 'admin@demo.com') WITH CHECK (auth.email() = 'admin@demo.com');


-- Functions for common queries
CREATE OR REPLACE FUNCTION get_user_domain(user_id UUID)
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN (SELECT domain FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_supervisor_executives(supervisor_id UUID)
RETURNS TABLE(executive_id UUID, executive_email VARCHAR(255)) AS $$
BEGIN
  RETURN QUERY
  SELECT id, email 
  FROM user_profiles 
  WHERE supervisor_id = $1 AND role = 'executive';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
