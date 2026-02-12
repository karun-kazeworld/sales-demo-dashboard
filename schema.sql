-- Enable UUID extension
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

-- Users table (for local auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with domain-specific supervisors
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('executive', 'supervisor', 'admin')),
  domain VARCHAR(50), -- Domain assignment (Banking, Automotive, etc.)
  supervisor_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
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
  compliance_status VARCHAR(20) CHECK (compliance_status IN ('pass', 'fail', 'warning')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo analyses (for Castrol-type products)
CREATE TABLE photo_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_product_executive ON conversations(product_id, executive_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_score ON conversations(total_score DESC);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_supervisor ON user_profiles(supervisor_id);
CREATE INDEX idx_user_profiles_domain ON user_profiles(domain);
CREATE INDEX idx_products_domain ON products(domain);
