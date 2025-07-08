-- Verification Script for User Setup
-- Run this in Supabase SQL Editor to check your user configuration

-- 1. Check all users in auth.users
SELECT 'AUTH USERS:' as section;
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC;

-- 2. Check users in our users table
SELECT 'APPLICATION USERS:' as section;
SELECT id, email, name, role, is_active FROM users ORDER BY role;

-- 3. Check admin profiles
SELECT 'ADMIN PROFILES:' as section;
SELECT a.id, u.email, u.name, a.permissions 
FROM admins a 
JOIN users u ON a.id = u.id;

-- 4. Check department officer profiles
SELECT 'DEPARTMENT OFFICER PROFILES:' as section;
SELECT do.id, u.email, u.name, d.name as department, d.code, do.position
FROM department_officers do
JOIN users u ON do.id = u.id
JOIN departments d ON do.department_id = d.id;

-- 5. Check student profiles
SELECT 'STUDENT PROFILES:' as section;
SELECT s.id, u.email, u.name, s.matricule, d.name as department, s.year_of_study
FROM students s
JOIN users u ON s.id = u.id
JOIN departments d ON s.department_id = d.id;

-- 6. Check for missing profiles (users in auth but not in our users table)
SELECT 'MISSING PROFILES:' as section;
SELECT au.id, au.email, 'Missing from users table' as issue
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 7. Check departments
SELECT 'DEPARTMENTS:' as section;
SELECT id, name, code FROM departments ORDER BY code;

-- 8. Quick setup templates for missing users
SELECT 'SETUP TEMPLATES:' as section;

-- For admin user (replace USER_ID and EMAIL):
SELECT 'Admin Setup:' as template_type,
'INSERT INTO users (id, email, name, role, is_active) VALUES (''USER_ID'', ''EMAIL'', ''System Administrator'', ''admin'', true);' as query_1,
'INSERT INTO admins (id, permissions) VALUES (''USER_ID'', ARRAY[''manage_users'', ''manage_complaints'', ''generate_reports'']);' as query_2;

-- For department officer (replace USER_ID, EMAIL, and DEPT_CODE):
SELECT 'Department Officer Setup:' as template_type,
'INSERT INTO users (id, email, name, role, is_active) VALUES (''USER_ID'', ''EMAIL'', ''Department Officer'', ''department_officer'', true);' as query_1,
'INSERT INTO department_officers (id, department_id, position) VALUES (''USER_ID'', (SELECT id FROM departments WHERE code = ''DEPT_CODE''), ''Department Officer'');' as query_2;
