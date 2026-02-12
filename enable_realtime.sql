-- Enable real-time for conversations table
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Enable real-time publication (if not already enabled)
-- This might already be enabled by default in newer Supabase projects
