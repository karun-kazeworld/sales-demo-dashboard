# Supabase Cloud Database - Production Setup

## 🎯 Current Status: PRODUCTION READY
**Live Supabase Integration** - Cloud database with real data and authentication.

## Database Connection Details

### Production Supabase Project
- **URL:** https://xxbdrtsowaawgsbbfqlt.supabase.co
- **Environment:** Production cloud database
- **Region:** Auto-selected optimal region
- **Status:** ✅ Active and operational

### Authentication
- **Provider:** Supabase Auth (built-in)
- **Users:** 5 active accounts (admin + supervisors + executives)
- **Sessions:** Persistent across browser refreshes
- **Security:** Row Level Security (RLS) enabled

## Database Schema (Production)

### Tables Overview
```sql
-- Core tables with RLS policies
├── products (2 records)
├── user_profiles (5 records) 
├── conversations (4 records)
└── auth.users (managed by Supabase)
```

### Complete Schema
```sql
-- Enable UUID extension (auto-enabled in Supabase)
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
  domain VARCHAR(50),
  supervisor_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
```

## Row Level Security (RLS) Policies

### Current Production Policies
```sql
-- user_profiles table
CREATE POLICY "Allow authenticated users to read all user_profiles" ON user_profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to insert user_profiles" ON user_profiles
FOR INSERT TO authenticated WITH CHECK (auth.email() = 'admin@demo.com');

CREATE POLICY "Allow admin to update user_profiles" ON user_profiles
FOR UPDATE TO authenticated USING (auth.email() = 'admin@demo.com') WITH CHECK (auth.email() = 'admin@demo.com');

-- products table
CREATE POLICY "Authenticated users can view products" ON products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to insert products" ON products
FOR INSERT TO authenticated WITH CHECK (auth.email() = 'admin@demo.com');

CREATE POLICY "Allow admin to update products" ON products
FOR UPDATE TO authenticated USING (auth.email() = 'admin@demo.com') WITH CHECK (auth.email() = 'admin@demo.com');

-- conversations table
CREATE POLICY "Allow authenticated users to read conversations" ON conversations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert conversations" ON conversations
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conversations" ON conversations
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

## Production Data

### Products (2 records)
```sql
-- Castrol CRB Turbomax (Automotive domain)
-- SBI Life Smart Annuity Plus (Banking domain)
```

### User Profiles (5 records)
```sql
-- admin@demo.com (admin role)
-- automotive.supervisor@demo.com (supervisor, Automotive domain)
-- castrol.executive@demo.com (executive, Automotive domain)
-- banking.supervisor@demo.com (supervisor, Banking domain)
-- sbi.executive@demo.com (executive, Banking domain)
```

### Conversations (4 records)
```sql
-- 2 Castrol conversations (scores: 54, 74)
-- 2 SBI conversations (scores: 68, 82)
```

## Environment Configuration

### React App Environment Variables
```env
# Production Supabase connection
REACT_APP_SUPABASE_URL=https://xxbdrtsowaawgsbbfqlt.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YmRydHNvd2Fhd2dzYmJmcWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzczNjcsImV4cCI6MjA4NTk1MzM2N30.btrYMEDKs7A9Htc2_TFThD1dCqz9diHtMG9TtbwQTEg
```

## Performance Optimizations

### Indexes (Production)
```sql
-- Conversation queries
CREATE INDEX idx_conversations_product_executive ON conversations(product_id, executive_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_score ON conversations(total_score DESC);
CREATE INDEX idx_conversations_compliance ON conversations(compliance_status);

-- User profile queries
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_supervisor ON user_profiles(supervisor_id);
CREATE INDEX idx_user_profiles_domain ON user_profiles(domain);

-- Product queries
CREATE INDEX idx_products_domain ON products(domain);
```

## Backup & Recovery

### Automatic Backups
- **Frequency:** Daily automatic backups by Supabase
- **Retention:** 7 days for free tier
- **Point-in-time Recovery:** Available for paid plans

### Manual Backup
```bash
# Export data via Supabase CLI
supabase db dump --db-url "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

## Monitoring & Logs

### Supabase Dashboard
- **Real-time Metrics:** Query performance, active connections
- **Logs:** Authentication, database queries, API calls
- **Usage:** Storage, bandwidth, function invocations

### Health Checks
- **Database Status:** ✅ Operational
- **API Endpoints:** ✅ Responding
- **Authentication:** ✅ Active sessions
- **RLS Policies:** ✅ Enforced

## Migration History

### Completed Migrations
1. **Initial Schema Creation** - Products, user_profiles, conversations tables
2. **RLS Policy Setup** - Security policies for all tables
3. **Sample Data Population** - Real conversation data with analysis results
4. **Index Optimization** - Performance indexes for common queries

### No Local PostgreSQL Required
- ❌ Local PostgreSQL setup (obsolete)
- ❌ Manual database management
- ✅ Fully managed cloud database
- ✅ Automatic scaling and maintenance

## Troubleshooting

### Common Issues
1. **Connection Errors:** Check environment variables
2. **RLS Policy Blocks:** Verify user authentication
3. **Query Performance:** Review indexes and query patterns

### Support Resources
- **Supabase Documentation:** https://supabase.com/docs
- **Community Support:** https://github.com/supabase/supabase/discussions
- **Status Page:** https://status.supabase.com

---
**Status:** ✅ Production Ready  
**Last Updated:** February 6, 2026  
**Database:** Live Supabase Cloud
