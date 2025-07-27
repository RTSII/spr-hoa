-- Complete Admin Setup for rob@ursllc.com
-- Run these commands in order in Supabase SQL Editor

-- Step 1: Find rob@ursllc.com's user ID
SELECT id, email FROM auth.users WHERE email = 'rob@ursllc.com' LIMIT 1;

-- Step 2: Make rob@ursllc.com admin (run after getting the ID from Step 1)
-- Replace the UUID below with the actual ID from Step 1
INSERT INTO admin_users (user_id, role) VALUES ('REPLACE-WITH-ACTUAL-ID', 'admin');

-- Step 3: Verify admin setup
SELECT au.*, u.email 
FROM admin_users au 
JOIN auth.users u ON au.user_id = u.id 
WHERE u.email = 'rob@ursllc.com';

-- Step 4: Test the admin review system
SELECT * FROM admin_review_queue;