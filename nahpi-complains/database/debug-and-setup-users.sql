-- Debug and Setup Users for Authentication Testing
-- Run this step by step in Supabase SQL Editor

-- STEP 1: Check what users exist in auth.users
SELECT 'STEP 1: Users in auth.users' as step;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('admin01@nahpi.edu', 'officer.com@nahpi.edu')
ORDER BY email;

-- STEP 2: Check what profiles exist in our users table
SELECT 'STEP 2: Profiles in users table' as step;
SELECT u.id, u.email, u.name, u.role, u.is_active
FROM users u
WHERE u.email IN ('admin01@nahpi.edu', 'officer.com@nahpi.edu')
ORDER BY u.email;

-- STEP 3: Check for missing profiles
SELECT 'STEP 3: Missing profiles (users in auth but not in users table)' as step;
SELECT au.id, au.email, 'Missing profile' as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email IN ('admin01@nahpi.edu', 'officer.com@nahpi.edu')
AND u.id IS NULL;

-- STEP 4: Check departments (needed for department officer)
SELECT 'STEP 4: Available departments' as step;
SELECT id, name, code FROM departments WHERE code = 'COM';

-- STEP 5: Setup admin user profile (REPLACE USER_ID with actual ID from STEP 1)
-- Uncomment and replace USER_ID after getting the actual ID from STEP 1

/*
-- Replace 'ADMIN_USER_ID_HERE' with the actual ID from STEP 1
INSERT INTO users (id, email, name, role, is_active) 
VALUES ('ADMIN_USER_ID_HERE', 'admin01@nahpi.edu', 'System Administrator', 'admin', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

INSERT INTO admins (id, permissions) 
VALUES ('ADMIN_USER_ID_HERE', ARRAY['manage_users', 'manage_complaints', 'generate_reports'])
ON CONFLICT (id) DO UPDATE SET
    permissions = EXCLUDED.permissions;
*/

-- STEP 6: Setup department officer profile (REPLACE USER_ID with actual ID from STEP 1)
-- Uncomment and replace USER_ID after getting the actual ID from STEP 1

/*
-- Replace 'OFFICER_USER_ID_HERE' with the actual ID from STEP 1
INSERT INTO users (id, email, name, role, is_active) 
VALUES ('OFFICER_USER_ID_HERE', 'officer.com@nahpi.edu', 'Computer Engineering Officer', 'department_officer', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

INSERT INTO department_officers (id, department_id, position) 
VALUES ('OFFICER_USER_ID_HERE', (SELECT id FROM departments WHERE code = 'COM'), 'Department Officer')
ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    position = EXCLUDED.position;
*/

-- STEP 7: Verify the setup after creating profiles
SELECT 'STEP 7: Verification after setup' as step;

-- Check admin setup
SELECT 'Admin verification:' as check_type, u.id, u.email, u.name, u.role, a.permissions
FROM users u
LEFT JOIN admins a ON u.id = a.id
WHERE u.email = 'admin01@nahpi.edu';

-- Check department officer setup
SELECT 'Department officer verification:' as check_type, u.id, u.email, u.name, u.role, d.name as department, do.position
FROM users u
LEFT JOIN department_officers do ON u.id = do.id
LEFT JOIN departments d ON do.department_id = d.id
WHERE u.email = 'officer.com@nahpi.edu';

-- Check student (should exist from registration)
SELECT 'Student verification:' as check_type, u.id, u.email, u.name, u.role, s.matricule, d.name as department
FROM users u
LEFT JOIN students s ON u.id = s.id
LEFT JOIN departments d ON s.department_id = d.id
WHERE s.matricule = 'UBa25T1000';

-- STEP 8: Test RLS policies
SELECT 'STEP 8: Testing RLS policies' as step;

-- Test if we can query users table (should work for authenticated users)
SELECT 'RLS test - users table accessible:' as test, COUNT(*) as user_count FROM users;

-- Test if we can query departments (should work for everyone)
SELECT 'RLS test - departments accessible:' as test, COUNT(*) as dept_count FROM departments;
