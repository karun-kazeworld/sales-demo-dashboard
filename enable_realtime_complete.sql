-- SQL Commands to Enable Real-time Subscriptions on conversations table

-- Step 1: Enable full replica identity (tracks all column changes)
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Step 2: Add conversations table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verification queries:

-- Check replica identity status (should show 'f' for full)
SELECT relname, relreplident 
FROM pg_class 
WHERE relname = 'conversations';

-- Check if table is in supabase_realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'conversations';
