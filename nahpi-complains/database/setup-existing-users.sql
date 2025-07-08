-- Setup Script for Existing Admin and Department Officer Users
-- Replace the email addresses and user IDs with your actual values

-- STEP 1: Find your user IDs
-- Run this query first to get the user IDs from auth.users:
-- SELECT id, email FROM auth.users WHERE email IN ('your-admin-email@domain.com', 'your-officer-email@domain.com');

-- STEP 2: Replace the values below with your actual data and run

-- Example Admin Setup (REPLACE WITH YOUR ACTUAL VALUES)
-- INSERT INTO users (id, email, name, role, is_active) 
-- VALUES (
--   'YOUR_ADMIN_USER_ID_FROM_AUTH_USERS', 
--   'your-admin-email@domain.com', 
--   'System Administrator', 
--   'admin', 
--   true
-- );

-- INSERT INTO admins (id, permissions) 
-- VALUES (
--   'YOUR_ADMIN_USER_ID_FROM_AUTH_USERS', 
--   ARRAY['manage_users', 'manage_complaints', 'generate_reports']
-- );

-- Example Department Officer Setup (REPLACE WITH YOUR ACTUAL VALUES)
-- For Computer Engineering Officer:
-- INSERT INTO users (id, email, name, role, is_active) 
-- VALUES (
--   'YOUR_OFFICER_USER_ID_FROM_AUTH_USERS', 
--   'your-officer-email@domain.com', 
--   'Computer Engineering Officer', 
--   'department_officer', 
--   true
-- );

-- INSERT INTO department_officers (id, department_id, position) 
-- VALUES (
--   'YOUR_OFFICER_USER_ID_FROM_AUTH_USERS', 
--   (SELECT id FROM departments WHERE code = 'COM'), 
--   'Department Officer'
-- );

-- STEP 3: Instructions for getting the correct values

-- 1. Get User IDs:
SELECT 'User IDs from auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- 2. Get Department IDs:
SELECT 'Department IDs:' as info;
SELECT id, name, code FROM departments ORDER BY name;

-- 3. Template for Admin User:
SELECT 'Template for Admin - Replace USER_ID and EMAIL:' as info;
SELECT 
  'INSERT INTO users (id, email, name, role, is_active) VALUES (''USER_ID'', ''EMAIL'', ''System Administrator'', ''admin'', true);' as admin_users_query,
  'INSERT INTO admins (id, permissions) VALUES (''USER_ID'', ARRAY[''manage_users'', ''manage_complaints'', ''generate_reports'']);' as admin_profile_query;

-- 4. Template for Department Officer:
SELECT 'Template for Department Officer - Replace USER_ID, EMAIL, and DEPT_CODE:' as info;
SELECT 
  'INSERT INTO users (id, email, name, role, is_active) VALUES (''USER_ID'', ''EMAIL'', ''Department Officer'', ''department_officer'', true);' as officer_users_query,
  'INSERT INTO department_officers (id, department_id, position) VALUES (''USER_ID'', (SELECT id FROM departments WHERE code = ''DEPT_CODE''), ''Department Officer'');' as officer_profile_query;

-- 5. Verify your setup:
SELECT 'Verification queries:' as info;
SELECT 'Check users table:' as check_type, id, email, name, role FROM users;
SELECT 'Check admins table:' as check_type, id, permissions FROM admins;
SELECT 'Check department_officers table:' as check_type, id, department_id, position FROM department_officers;
