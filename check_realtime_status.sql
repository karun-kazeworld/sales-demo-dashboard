-- Check if real-time replication is enabled for conversations table
SELECT schemaname, tablename, hasindexes, hasrules, hastriggers, rowsecurity
FROM pg_tables 
WHERE tablename = 'conversations';

-- Check replica identity setting (needed for real-time)
SELECT schemaname, tablename, replicaidentity 
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'conversations' AND n.nspname = 'public';

-- More detailed replica identity check
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN c.relreplident = 'd' THEN 'default'
        WHEN c.relreplident = 'n' THEN 'nothing'
        WHEN c.relreplident = 'f' THEN 'full'
        WHEN c.relreplident = 'i' THEN 'index'
    END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_tables t ON t.tablename = c.relname AND t.schemaname = n.nspname
WHERE c.relname = 'conversations' AND n.nspname = 'public';
