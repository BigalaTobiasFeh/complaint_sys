-- Fix RLS Policies for Student Registration and Admin/Department Login
-- Run this in Supabase SQL Editor to fix the authentication issues

-- Add missing INSERT policies for users table
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Add missing INSERT policies for students table  
CREATE POLICY "Students can insert own data" ON students FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policies for admins and department_officers tables
CREATE POLICY "Admins can view own data" ON admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can insert own data" ON admins FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Department officers can view own data" ON department_officers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Department officers can insert own data" ON department_officers FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing policies before creating new ones (to avoid duplication errors)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "Admins can view all department_officers" ON department_officers;
DROP POLICY IF EXISTS "Officers can view department students" ON students;
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;

-- Allow admins to read all users (for management)
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to read all students
CREATE POLICY "Admins can view all students" ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to read all department officers
CREATE POLICY "Admins can view all department_officers" ON department_officers FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow department officers to read students in their department
CREATE POLICY "Officers can view department students" ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM department_officers dept_officer 
        WHERE dept_officer.id = auth.uid() AND dept_officer.department_id = students.department_id
    )
);

-- Allow everyone to read departments (for dropdown lists)
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT TO authenticated USING (true);

-- Refresh the schema
NOTIFY pgrst, 'reload schema';
